import React from 'react'
import { HydrateClient } from '~/trpc/server'
import TodoList from './_components/todoList/todo'

const Page = () => {
  return (
    <HydrateClient>
      <TodoList />
    </HydrateClient>
  )
}

export default Page
