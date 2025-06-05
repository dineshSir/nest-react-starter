import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_user/')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/_app/_user/"!</div>
}
