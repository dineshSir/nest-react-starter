import { createFileRoute, Link } from '@tanstack/react-router'

export const Route = createFileRoute('/_app/_admin/success')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6">
      <div className="bg-white rounded-lg shadow-md p-8 max-w-md w-full text-center">
        <div className="mb-6">
          <div className="flex justify-center">
            <div className="bg-green-100 p-3 rounded-full">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Payment Successful</h1>
        <p className="text-gray-600 mb-6">
          Thank you! Your payment has been processed successfully. You can now download your admit card.
        </p>
        <div className="flex flex-col gap-3">
        <Link
          to='/' 
            className="bg-primary text-white py-2 px-6 rounded-md hover:bg-primary/90 transition-colors"
          >
            Go Back
          </Link>
          <Link 
            to='/'
            className="text-primary hover:underline"
          >
            Return to Home
          </Link>
        </div>
      </div>
    </div>
  )
}