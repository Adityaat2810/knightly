import type React from "react"

export const Button = ({
    onClick, children}:{onClick:()=> void, children: React.ReactNode
    }) => {
    return <button
      className="px-8 py-4 text-2xl bg-green-500 hover:bg-green-700 text-amber-100
      font-bold rounded"
      onClick={onClick}
    >
        {children}
    </button>
}