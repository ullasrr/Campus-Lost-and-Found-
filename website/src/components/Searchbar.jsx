import React from 'react'

const Searchbar = () => {
  return (
    <div className='flex justify-between px-25 py-6 bg-gray-100'>
        <input type="text"
         placeholder="Search..."
         className="p-2 border border-gray-300 rounded"
         />

        <div className='flex space-x-4 -translate-x-10'>
            <button>All items</button>
            <button>Found items</button>
            <button>Lost items</button>
        </div>
    </div>

  )
}

export default Searchbar
