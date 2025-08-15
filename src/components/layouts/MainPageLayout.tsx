import { Outlet } from 'react-router-dom'

const MainPageLayout = () => {
  return (
    <div className="flex flex-col h-screen">
        <main className="flex-1 bg-gray-100">
            <Outlet />
        </main>
    </div>
  )
}

export default MainPageLayout