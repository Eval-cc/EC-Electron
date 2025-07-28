/**
 * @time   2025/05/27 09:29:35
 * @author Eval
 * @description
 */
import Database from "better-sqlite3";
import path, {join as EcJson} from "path";
import fs from "fs-extra";
import {ec_source_path} from "./ec-proce";

interface ColumnConfig {
    type: "TEXT" | "BOOLEAN" | "INTEGER" | "REAL" | "BLOB" | "NUMERIC";
    primaryKey?: boolean | "autoincrement";
    constraints?: string[];
    defaultValue?: string | number | boolean;
    notNull?: boolean;
    unique?: boolean;
    autoIncrement?: boolean;
}

type TableSchema = Record<string, ColumnConfig>;

export default class EcSqlite3 {
    private db: Database.Database;

    constructor(dbFileName = "db.sqlite") {
        const dbPath = EcJson(ec_source_path, "db", dbFileName);
        // 目录不存在, 创建目录
        if (!fs.pathExistsSync(dbPath)) {
            fs.mkdirpSync(path.dirname(dbPath));
        }

        if (!fs.existsSync(dbPath)) {
            fs.writeFileSync(dbPath, "");
        }

        this.db = new Database(dbPath);
    }
    /**
     * 将单个字段配置转为建表 SQL 片段
     * const sql = generateCreateTableSQL("maps", {
        id: { type: "INTEGER", key: "autoincrement" },
        name: { type: "TEXT", notNull: true, unique: true },
        data: { type: "TEXT", defaultValue: "{}" },
        created_at: { type: "TEXT", defaultValue: "CURRENT_TIMESTAMP", notNull: true }
    });
     */
    private transColumnConfig(column: string, config: ColumnConfig): string {
        const {primaryKey, type, constraints = [], defaultValue, notNull = false, unique = false, autoIncrement = false} = config;

        let result = `${column} ${type}`;

        if (primaryKey) {
            result += " PRIMARY KEY";
            if ((autoIncrement || primaryKey === "autoincrement") && type === "INTEGER") {
                result += " AUTOINCREMENT";
            }
        }

        if (notNull) {
            result += " NOT NULL";
        }

        if (unique) {
            result += " UNIQUE";
        }

        if (defaultValue !== undefined) {
            const defaultValueStr = typeof defaultValue === "string" ? `'${defaultValue.replace(/'/g, "''")}'` : String(defaultValue);
            result += ` DEFAULT ${defaultValueStr}`;
        }

        if (constraints.length > 0) {
            result += " " + constraints.join(" ");
        }

        return result;
    }

    /**
     * 生成 CREATE TABLE SQL
     */
    createTable(tableName: string, schema: TableSchema): string {
        const columnDefs = Object.entries(schema).map(([col, cfg]) => this.transColumnConfig(col, cfg));
        return this.run(`CREATE TABLE IF NOT EXISTS ${tableName} (\n  ${columnDefs.join(",\n  ")}\n);`);
    }

    /**
     * 执行 SELECT 多行查询
     */
    public queryAll<T = any>(sql: string, params: any[] = []): T[] {
        return this.db.prepare(sql).all(params);
    }

    /**
     * 执行 SELECT 单行查询
     */
    public query<T = any>(sql: string, params: any[] = []): T | undefined {
        return this.db.prepare(sql).get(params);
    }

    /**
     * 执行 INSERT、UPDATE、DELETE 等非查询语句
     */
    public run(sql: string, params: any[] = []): Database.RunResult {
        return this.db.prepare(sql).run(params);
    }

    /**
     * 执行事务逻辑
     */
    public transaction(fn: (db: EcSqlite3) => void): void {
        const trx = this.db.transaction(() => fn(this));
        trx();
    }

    /**
     * 关闭数据库连接
     */
    public close(): void {
        this.db.close();
    }

    // 在 EcSqlite3 类中添加：

    /**
     * 检查某张表是否存在
     */
    public hasTable(table: string): boolean {
        const row = this.db.prepare(`SELECT name FROM sqlite_master WHERE type='table' AND name=? LIMIT 1`).get([table]);
        return !!row;
    }

    /**
     * 获取所有表名
     */
    public getTables(): string[] {
        const rows = this.db.prepare(`SELECT name FROM sqlite_master  WHERE type='table' AND name NOT LIKE 'sqlite_%'`).all();
        return rows.map((r) => r.name);
    }

    /**
     * 检查表中是否存在某字段
     */
    public hasColumn(table: string, column: string): boolean {
        const rows = this.db.prepare(`PRAGMA table_info(${table})`).all();
        return rows.some((col) => col.name === column);
    }

    /**
     * 给指定的表增加字段
     * @param table
     * @param column
     * @returns
     */
    public addTableColumn(table: string, column: {[key: string]: ColumnConfig}): boolean {
        const columnName = Object.keys(column)[0];
        const config = column[columnName];

        if (!this.hasColumn(table, columnName)) {
            const columnDef = this.transColumnConfig(columnName, config); // 使用前面定义的生成字段SQL的函数
            this.run(`ALTER TABLE ${table} ADD COLUMN ${columnDef}`);
            return true;
        }

        return false;
    }

    toString(): string {
        return "[class EcSqlite3]";
    }
}
