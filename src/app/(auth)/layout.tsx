import MainLayout from "@/components/layout/main-layout";
import React from 'react'

const AuthLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <MainLayout>{ children }</MainLayout>
  )
}

export default AuthLayout
