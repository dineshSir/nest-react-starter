import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_admin/failed')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="bg-red-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Failed</h1>
        <p className="text-gray-600 mb-6">
          We're sorry, but your payment could not be processed. Please check your payment details and try again.
        </p>
        
      </div>
    </div>
  )
}