import { desc, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import { todos } from "~/server/db/schema";
import { createTRPCRouter, publicProcedure } from "../trpc";
const fetcher = async (url: string) => {
  const res = await fetch(url);
  return res.json();
};
export const todoRouter = createTRPCRouter({
  getTodos: publicProcedure
    .input(z.object({ statuses: z.array(z.number()) }))
    .query(async ({ ctx, input }) => {
      const todoList = await ctx.db
        .select()
        .from(todos)
        .where(inArray(todos.status, input.statuses))
        .orderBy(desc(todos.createdAt));
      return todoList;
    }),

  // getTodos: publicProcedure.query(async ({ ctx,input }) => {
  //   const todoList = await ctx.db.query.todos.findMany({
  //  })
  //   return todoList
  // }),
  toggleTodo: publicProcedure
    .input(z.object({ id: z.number(), status: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(todos)
        .set({ status: input.status })
        .where(eq(todos.id, input.id));
    }),
  addTodo: publicProcedure
    .input(
      z.object({
        title: z.string().min(1),
        status: z.number().min(0).max(1),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      await ctx.db.insert(todos).values({
        title: input.title,
        status: input.status,
      });
    }),
  completeAllTodos: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db.update(todos).set({ status: 1 });
  }),
  deleteTodo: publicProcedure
    .input(z.object({ id: z.number() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db.delete(todos).where(eq(todos.id, input.id));
    }),
  deleteAllTodos: publicProcedure.mutation(async ({ ctx }) => {
    await ctx.db.delete(todos);
  }),
  editTodo: publicProcedure
    .input(z.object({ id: z.number(), title: z.string() }))
    .mutation(async ({ ctx, input }) => {
      await ctx.db
        .update(todos)
        .set({ title: input.title })
        .where(eq(todos.id, input.id));
    }),
  generateTodo: publicProcedure.mutation(async ({ ctx }) => {
    const data = await fetcher("https://jsonplaceholder.typicode.com/todos");
    data.map(async (todo: { title: string }) => {
      await ctx.db.insert(todos).values({
        title: todo.title,
        status: 0,
      });
    });
  }),
});
