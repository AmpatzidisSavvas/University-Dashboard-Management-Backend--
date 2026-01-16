import { and, desc, eq, getTableColumns, ilike, or, sql } from "drizzle-orm";
import express from "express";
import { departments, subjects } from "../db/schema";
import { db } from "../db";

const subjectRouter = express.Router();

// Get all subjects with optional search, department filter, and pagination
subjectRouter.get("/", async (req, res) => {
  try {
    const { search, department, page = 1, limit = 10 } = req.query;

    const currentPage = Math.max(1, +page);
    const limitPerPage = Math.max(1, +limit);
    const offset = (currentPage - 1) * limitPerPage;

    const filterConditions = [];

    if (search) {
      filterConditions.push(
        or(
          ilike(subjects.name, `%${search}%`),
          ilike(subjects.code, `%${search}%`)
        )
      );
    }

    if (department) {
      filterConditions.push(ilike(departments.name, `%${department}%`));
    }

    const whereClause =
      filterConditions.length > 0 ? and(...filterConditions) : undefined;

    // Count query MUST include the join
    const countResult = await db
      .select({ count: sql<number>`count(*)` })
      .from(subjects)
      .leftJoin(departments, eq(subjects.deparmentId, departments.id))
      .where(whereClause);

    const totalCount = countResult[0]?.count ?? 0;

    // Data query
    const subjectsList = await db
      .select({
        ...getTableColumns(subjects),
        department: {
          ...getTableColumns(departments),
        },
      })
      .from(subjects)
      .leftJoin(departments, eq(subjects.deparmentId, departments.id))
      .where(whereClause)
      .orderBy(desc(subjects.createAt))
      .limit(limitPerPage)
      .offset(offset);

    res.status(200).json({
      data: subjectsList,
      pagination: {
        page: currentPage,
        limit: limitPerPage,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitPerPage),
      },
    });
  } catch (error) {
    console.error("GET /subjects error:", error);
    res.status(500).json({ error: "Failed to fetch subjects" });
  }
});

export default subjectRouter;