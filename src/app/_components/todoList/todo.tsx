"use client";
import React from "react";
import { Button } from "~/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { cn } from "~/lib/utils";
import { api } from "~/trpc/react";
export default function TodoList() {
  const [deleteLoading, setDeleteLoading] = React.useState(false);
  const [generateLoading, setGenerateLoading] = React.useState(false);
  const [editLoading, setEditLoading] = React.useState(false);
  const [status, setStatus] = React.useState([0, 1]);
  const getTodos = api.todo.getTodos.useQuery({ statuses: status });
  const checkTodos = api.todo.completeAllTodos.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const deleteTodos = api.todo.deleteTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const toggleTodo = api.todo.toggleTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const addTodo = api.todo.addTodo.useMutation({
    onSettled: () => {
      getTodos.refetch();
    },
  });
  const generateTodos = api.todo.generateTodo.useMutation({
    onMutate: () => {
      setGenerateLoading(true);
    },
    onError: () => {
      setGenerateLoading(false);
    },
    onSuccess: () => {
      getTodos.refetch();
      setGenerateLoading(false);
    },
  });
  const editTodo = api.todo.editTodo.useMutation({
    onMutate: () => {
      setEditLoading(true);
    },
    onSuccess: () => {
      getTodos.refetch();
      setEditLoading(false);
    },
  });
  const deleteAllTodos = api.todo.deleteAllTodos.useMutation({
    onMutate: () => {
      setDeleteLoading(true);
    },
    onError: () => {
      setDeleteLoading(false);
    },
    onSuccess: () => {
      getTodos.refetch();
      setDeleteLoading(false);
    },
  });
  const handleDelete = () => {
    setDeleteLoading(true);
    deleteAllTodos.mutate();
    setDeleteLoading(false);
  };
  const handleCheck = () => {
    checkTodos.mutate();
  };
  const [todoItem, setTodoItem] = React.useState("");

  const handleAddTodo = () => {
    if (todoItem.length) {
      addTodo.mutate({ title: todoItem, status: 0 });
      setTodoItem("");
    }
  };

  return (
    <div className="mx-auto w-full max-w-4xl ">
      <h1 className="flex items-center justify-center font-extrabold text-4xl text-accent-foreground">
        TodoList
      </h1>
      <div className=" mt-10 flex items-center justify-center gap-2 ">
        <Input
          type="text"
          placeholder="Enter Todo"
          value={todoItem}
          className="mr-10 flex-grow"
          onChange={(e) => setTodoItem(e.target.value)}
        />
        <Button onClick={handleAddTodo}>Add Todo</Button>
        <Button
          variant={"secondary"}
          onLoad={() => setGenerateLoading(true)}
          onClick={() => generateTodos.mutate()}
        >
          {generateLoading ? "Generating..." : "Generate Todos"}
        </Button>
        <Button variant="destructive" onClick={handleCheck}>
          {deleteLoading ? "Checking..." : "Check All"}
        </Button>
        <Button variant={"destructive"} onClick={handleDelete}>
          {deleteLoading ? "Deleting..." : "Delete All"}
        </Button>
      </div>
      <div className="mt-4 flex flex-row gap-2 ">
        <Button
          variant={"outline"}
          onClick={() => {
            setStatus([0, 1]);
            getTodos.refetch();
          }}
        >
          All
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            setStatus([0]);
            getTodos.refetch();
          }}
        >
          Incompleted
        </Button>
        <Button
          variant={"outline"}
          onClick={() => {
            setStatus([1]);
            getTodos.refetch();
          }}
        >
          Completed
        </Button>
      </div>
      {getTodos.isLoading ? (
        <div>Loading...</div>
      ) : (
        <div>
          <div className="todo mt-4 w-full ">
            {getTodos.data?.map((todo) => (
              <div
                key={todo.id}
                className={cn(
                  todo.status === 1 ? "bg-green-200 " : "",
                  "mt-2 flex items-center gap-2 border p-2",
                )}
              >
                <input
                  type="checkbox"
                  className="h-5 w-5 items-center border"
                  onChange={() => {
                    toggleTodo.mutate({
                      id: todo.id,
                      status: todo.status === 0 ? 1 : 0,
                    });
                  }}
                  checked={todo.status === 1}
                  key={todo.id}
                />
                <span
                  className={cn(
                    todo.status === 1 ? "line-through" : "",
                    "flex-grow font-lg text-primary",
                  )}
                >
                  {todo.title}
                </span>
                <span className="text-gray-500 text-sm">
                  {todo.createdAt.toISOString().split("T")[0]}
                </span>
                {todo.status === 0 ? (
                  <>
                    <Dialog>
                      <DialogTrigger className="inline-flex items-center justify-center whitespace-nowrap rounded-md border px-6 py-2 font-medium text-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50">
                        Edit
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>Edit Todo</DialogTitle>
                          <DialogDescription className="flex flex-col gap-2">
                            <div>
                              {" "}
                              <Input
                                type="text"
                                placeholder={todo.title}
                                value={todoItem}
                                onChange={(e) => setTodoItem(e.target.value)}
                              />
                              <RadioGroup
                                defaultValue="in-complete"
                                className="flex py-2"
                              >
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="in-complete"
                                    id="in-complete"
                                    onClick={(e) => {
                                      e.preventDefault();
                                      toggleTodo.mutate({
                                        id: todo.id,
                                        status: 0,
                                      });
                                    }}
                                  />
                                  <Label htmlFor="in-complete">
                                    Incomplete
                                  </Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <RadioGroupItem
                                    value="complete"
                                    id="complete"
                                    onClick={(e) => {
                                      e.preventDefault();

                                      toggleTodo.mutate({
                                        id: todo.id,
                                        status: 1,
                                      });
                                    }}
                                  />
                                  <Label htmlFor="complete">complete</Label>
                                </div>
                              </RadioGroup>
                            </div>

                            <Button
                              onClick={() => {
                                editTodo.mutate({
                                  id: todo.id,
                                  title: todoItem,
                                });
                                setTodoItem("");
                              }}
                            >
                              {editLoading ? "Editing..." : "Edit"}
                            </Button>
                          </DialogDescription>
                        </DialogHeader>
                      </DialogContent>
                    </Dialog>
                  </>
                ) : (
                  <></>
                )}
                <Button
                  variant={"destructive"}
                  onClick={() => {
                    deleteTodos.mutate({ id: todo.id });
                  }}
                >
                  Delete
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
