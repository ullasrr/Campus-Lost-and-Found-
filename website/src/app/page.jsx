import Searchbar from "@/components/Searchbar";
import Image from "next/image";

export default function Home() {
  return (
    <div>
      <nav className='flex justify-between p-4 bg-gray-800 text-white'>
            <div>Campus Lost and Found</div>

            <div>Add item</div>

      </nav>

      {/* <div className="w-full bg-red-500">
        <div className="flex justify-between items-center p-10 bg-red-300 ">
        <div>

          lost found all items
        </div>
        <div>
          Searchbar
        </div>
        </div>
      </div> */}
      
      <Searchbar/>
     


      {/* <div>
        List items
      </div> */}
      
    </div>
  );
}
