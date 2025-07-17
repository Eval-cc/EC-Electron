/**
 * @time   2025/05/27 09:29:35
 * @author Eval
 * @description
 */
import sqlite3 from "sqlite3";
import {join as EcJson} from "path";
import {ec_source_path} from "./ec-proce";
import GlobalStatus from "../core/ec-global";
import {IPCModelTypeRender} from "../lib/ec-models";
import {IPCResult} from "../core/ec-IPCResult";

interface ColumnConfig {
    /** 列名 */
    column: string;
    /** 列类型 (SQLite3 实际支持的类型) */
    type: "TEXT" | "BOOLEAN" | "INTEGER" | "REAL" | "BLOB" | "NUMERIC";
    /** 是否为主键(如果是，会自动添加PRIMARY KEY约束) */
    key?: boolean | "autoincrement"; // 可选值: true/false 或 "autoincrement"
    /** 额外约束 (如 NOT NULL, UNIQUE 等) */
    constraints?: string[];
    /** 默认值 (仅对某些类型有效) */
    defaultValue?: string | number | boolean;
    /** 是否允许 NULL (如果未设置，默认允许 NULL) */
    notNull?: boolean;
    /** 是否唯一 (UNIQUE 约束) */
    unique?: boolean;
    /** 是否自增 (仅对 INTEGER 主键有效) */
    autoIncrement?: boolean;
}

export default class Sqlite3 {
    // 静态实例属性
    private static instance: Sqlite3;
    // 连接池（管理多个数据库连接）
    private connectionPool: {[key: string]: sqlite3.Database};

    // 私有构造函数（防止外部 new）
    private constructor() {
        this.connectionPool = {};
    }

    // 获取单例实例的静态方法
    public static getInstance(): Sqlite3 {
        if (!Sqlite3.instance) {
            Sqlite3.instance = new Sqlite3();
        }
        return Sqlite3.instance;
    }

    transColumnConfig(columnConfig: ColumnConfig): string {
        const {column, key, type, constraints = [], defaultValue, notNull = false, unique = false, autoIncrement = false} = columnConfig;
        let result = `${column} ${type}`;
        // 处理主键
        if (key) {
            result += " PRIMARY KEY";
            if (autoIncrement && key !== "autoincrement") {
                // 如果是主键且需要自增
                result += " AUTOINCREMENT";
            }
        }
        // 处理 NOT NULL
        if (notNull) {
            result += " NOT NULL";
        }
        // 处理 UNIQUE
        if (unique) {
            result += " UNIQUE";
        }
        // 处理默认值
        if (defaultValue !== undefined) {
            const defaultValueStr =
                typeof defaultValue === "string"
                    ? `'${defaultValue.replace(/'/g, "''")}'` // 处理字符串中的单引号
                    : String(defaultValue);
            result += ` DEFAULT ${defaultValueStr}`;
        }
        // 处理额外约束
        if (constraints.length > 0) {
            result += " " + constraints.join(" ");
        }
        return result;
    }

    /**
     * 获取或创建数据库连接
     * @param dbName
     * @returns
     */
    private getConnection(dbName: string, overPath: boolean = false): sqlite3.Database {
        const dbPath = overPath ? dbName : EcJson(ec_source_path, "data", dbName);
        if (!this.connectionPool[dbPath]) {
            this.connectionPool[dbPath] = new sqlite3.Database(dbPath, (err) => {
                if (err) {
                    GlobalStatus.logger.error(`${dbPath} 数据库连接失败:${err.message}`);
                    return GlobalStatus.control.SendRenderMsg({success: false, msg: `数据库连接失败:${err.message}`});
                } else GlobalStatus.control.SendRenderMsg({success: true, msg: `已连接到数据库: ${dbName}`});
            });
        }
        return this.connectionPool[dbPath];
    }

    /**
     * 创建表
     * @param dbName
     * @param tableName
     * @param columns
     * @returns
     */
    createTable(dbName: string, tableName: string, columns: ColumnConfig[], overPath: boolean = false): Promise<IPCModelTypeRender> {
        const db = this.getConnection(dbName, overPath);
        const columnDefinitions = columns.map(this.transColumnConfig).join(", ");
        const sql = `CREATE TABLE IF NOT EXISTS ${tableName} (${columnDefinitions})`;
        return new Promise((resolve) => {
            db.run(sql, (err) => {
                if (err) {
                    GlobalStatus.logger.error(`创建表 ${tableName} 失败:${err.message}`);
                    return resolve(IPCResult(false, `创建表 ${tableName} 失败:${err.message}`));
                } else resolve(IPCResult(true, `创建表 ${tableName} 成功`));
            });
        });
    }

    /**
     * 插入数据
     * @param dbName
     * @param tableName
     * @param data
     * @returns
     */
    insert(dbName: string, tableName: string, data: Record<string, any>, overPath: boolean = false): Promise<IPCModelTypeRender> {
        const db = this.getConnection(dbName, overPath);
        const columns = Object.keys(data).join(", ");
        const placeholders = Object.keys(data)
            .map(() => "?")
            .join(", ");
        const values = Object.values(data);
        const sql = `INSERT INTO ${tableName} (${columns}) VALUES (${placeholders})`;
        return new Promise((resolve) => {
            db.run(sql, values, function (err) {
                if (err) resolve(IPCResult(false, `插入数据失败:${err.message}`));
                else resolve(IPCResult(true, `插入成功,ID: ${this.lastID}`));
            });
        });
    }

    /**
     * 查询所有数据
     * @param dbName
     * @param tableName
     * @returns
     */
    getAll(dbName: string, tableName: string, overPath: boolean = false): Promise<IPCModelTypeRender> {
        return new Promise((resolve) => {
            const db = this.getConnection(dbName, overPath);
            db.all(`SELECT * FROM ${tableName}`, [], (err, rows) => {
                if (err) resolve(IPCResult(false, err.message));
                else resolve(IPCResult(true, "", {rows}));
            });
        });
    }

    /**
     * 获取单个数据
     * @param dbName
     * @param tableName
     * @param condition
     * @returns
     */
    getOne(dbName: string, tableName: string, condition: Record<string, any>, overPath: boolean = false): Promise<IPCModelTypeRender> {
        return new Promise((resolve) => {
            const db = this.getConnection(dbName, overPath);
            const sql = `SELECT * FROM ${tableName} WHERE ${Object.keys(condition).join(" = ? AND ")} = ?`;
            const values = Object.values(condition);
            db.get(sql, values, (err, row) => {
                if (err) resolve(IPCResult(false, err.message));
                else resolve(IPCResult(true, "", {row}));
            });
        });
    }

    /**
     * 更新节点
     * @param dbName
     * @param tableName
     * @param data
     * @param condition
     * @returns
     */
    update(dbName: string, tableName: string, data: Record<string, any>, condition: Record<string, any>, overPath: boolean = false): Promise<IPCModelTypeRender> {
        const db = this.getConnection(dbName, overPath);
        const set = Object.keys(data)
            .map((key) => `${key} = ?`)
            .join(", ");
        const values = Object.values(data).concat(Object.values(condition));
        const sql = `UPDATE ${tableName} SET ${set} WHERE ${Object.keys(condition).join(" = ? AND ")} = ?`;
        return new Promise((resolve) => {
            db.run(sql, values, function (err) {
                if (err) resolve(IPCResult(false, `更新数据失败:${err.message}`));
                else resolve(IPCResult(true, `更新成功,影响行数: ${this.changes}`));
            });
        });
    }

    /**
     * 删除节点
     * @param dbName
     * @param tableName
     * @param condition
     * @returns
     */
    delete(dbName: string, tableName: string, condition: Record<string, any>, overPath: boolean = false): Promise<IPCModelTypeRender> {
        const db = this.getConnection(dbName, overPath);
        const sql = `DELETE FROM ${tableName} WHERE ${Object.keys(condition).join(" = ? AND ")} = ?`;
        const values = Object.values(condition);
        return new Promise((resolve) => {
            db.run(sql, values, function (err) {
                if (err) resolve(IPCResult(false, `删除数据失败:${err.message}`));
                else resolve(IPCResult(true, `删除成功,影响行数: ${this.changes}`));
            });
        });
    }

    /**
     * 关闭所有数据库连接（谨慎使用！）
     */
    closeAll(): void {
        Object.values(this.connectionPool).forEach((db) => {
            db.close((err) => {
                if (err) console.error("关闭数据库失败:", err.message);
            });
        });
        this.connectionPool = {};
    }

    closeDBByPath(dbName: string, overPath: boolean = false): void {
        const dbPath = overPath ? dbName : EcJson(ec_source_path, "data", dbName);
        const db = this.connectionPool[dbPath];
        if (db) {
            db.close((err) => {
                if (err) console.error("关闭数据库失败:", err.message);
            }); // 关闭数据库连接
            delete this.connectionPool[dbPath]; // 删除数据库连接池中的记录
        }
    }
    toString(): string {
        return "[class Sqlite3]";
    }
}
