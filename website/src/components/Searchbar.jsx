'use client'
import React, { useState,useEffect } from 'react'
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { createClient } from '@/utils/supabase/client';
const supabase = createClient()

const Searchbar = () => {
  const [items,setitems]=useState([])
  const [loading,setloading]=useState(false)
  const [error,seterror]=useState(null)
  const [editing,setediting]=useState(false)
  const [form, setForm]= useState({title: "", description: "", date:"", location:"", contact:"", type:"",image:"" });
  const [newImage, setNewImage] = useState(null);     
  const today = new Date().toISOString().split('T')[0];



  const [search,setsearch]=useState("")
  const [filter,setFilter]=useState("All")

  useEffect(() => {
    const fetchItems = async () => {
      setloading(true)

      let query=supabase
        .from("items")
        .select("*")
        .order("date",{ascending:false})

      if(search.trim()!==""){
        query = query.or(
          `title.ilike.%${search}%,description.ilike.%${search}%`
        );
      }

      if (filter !== "All") {
        query = query.eq("type", filter);    
      }

      const {data,error}=await query
      if(error){
        seterror(error.message)
      }
      else{
        setitems(data?.length > 0 ? data : [])
      }

      setloading(false)
    }
    fetchItems();
  }, [search, filter])

  const handleDelete = async (id) => {
    if (!confirm("Delete this item?")) return;
    const { error } = await supabase.from("items").delete().eq("id", id);
    if (error) alert(error.message);
    else setitems((prev) => prev.filter((it) => it.id !== id));
  };

  const openEdit = (item) => {
  setediting(item.id);
  setForm({
    title: item.title,
    description: item.description,
    date: item.date,
    location: item.location,
    contact: item.contact,
    type: item.type,
    image: item.image,           
  });
  setNewImage(null);             
};

  const saveEdit = async () => {
  let imageUrl = form.image;                          

  if (newImage) {
    const ext      = newImage.name.split(".").pop();
    const fileName = `${form.title}-${Date.now()}.${ext}`;

    const { error: upErr } = await supabase
      .storage.from("images")
      .upload(fileName, newImage, { upsert:true });
    if (upErr) { alert(`Upload failed: ${upErr.message}`); return; }

    const { data: urlData } = supabase
      .storage.from("images")
      .getPublicUrl(fileName);
    imageUrl = urlData.publicUrl;
  }
  if (!imageUrl) {
  const { data } = supabase
    .storage.from('images')
    .getPublicUrl('images.png');         
  imageUrl = data.publicUrl;
}

  const { error } = await supabase
    .from("items")
    .update({ ...form, image: imageUrl })
    .eq("id", editing);
  if (error) { alert(error.message); return; }

  setitems((prev) =>
    prev.map((it) =>
      it.id === editing ? { ...it, ...form, image: imageUrl } : it
    )
  );
  setediting(null);
};



  
  return (
    <div >
        

        <div className='flex justify-between px-20 py-6 bg-gray-100'>
         <Input type="text" placeholder="Search..." 
         className="px-4 py-2 border border-gray-300 rounded-lg w-1/2"
         value={search}
         onChange={(e) => setsearch(e.target.value)}
         />

        <div className="flex space-x-6 text-white">
          <Button
            variant="outline"
            className={`bg-slate-600 hover:bg-slate-300 cursor-pointer ${filter === "All" ? "bg-slate-300 text-black" : ""}`}
            onClick={() => setFilter("All")}
          >
            All items
          </Button>
          <Button
            variant="outline"
            className={`bg-slate-600 hover:bg-slate-300 cursor-pointer ${filter === "Found" ? "bg-slate-300 text-black" : ""}`}
            onClick={() => setFilter("Found")}
          >
            Found items
          </Button>
          <Button
            variant="outline"
            className={`bg-slate-600 hover:bg-slate-300 cursor-pointer ${filter === "Lost" ? "bg-slate-300 text-black" : ""}`}
            onClick={() => setFilter("Lost")}
          >
            Lost items
          </Button>
        </div>
</div>
        {/* List view */}
        <div className="px-8 sm:px-14 lg:px-20 py-6 bg-gray-200 ">
        {loading && <p className="text-center">Loading…</p>}
        {error   && <p className="text-center text-red-600">{error}</p>}
        {!loading && items.length === 0 && (
          <p className="text-center">No items found.</p>
        )}

        <div className="mt-6 grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((it) => (
            <div
              key={it.id}
              className="bg-white rounded-lg shadow-sm hover:shadow-md p-4 flex flex-col"
            >
              {it.image && (
                <img
                  src={it.image}
                  alt={it.title}
                  className="h-60 w-full object-cover rounded-md mb-3"
                />
              )}

              
            <div className="flex items-center justify-between gap-3">
              <h3 className="font-semibold text-gray-900 text-lg leading-tight truncate">
                {it.title}
              </h3>
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium whitespace-nowrap ${
                  it.type === "Lost"
                    ? "bg-red-50 text-red-700 border border-red-200"
                    : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                }`}
              >
                {it.type}
              </span>
            </div>

              <p className="mt-1 text-sm line-clamp-3">{it.description}</p>

              <div className="mt-auto pt-3 text-sm text-gray-500 space-y-2 font-bold ">
                <p>Date: {it.date}</p>
                <p>Location: {it.location}</p>
                <p>Contact: {it.contact}</p>
              </div>

              <div className="flex space-x-2 mt-4 self-end p-2">
                <Button size="xs" variant="outline" onClick={() => openEdit(it)} className='px-3 py-2 cursor-pointer'>
                  Edit
                </Button>
                <Button
                  size="xs"
                  variant="destructive"
                  onClick={() => handleDelete(it.id)}
                  className='px-3 py-2 cursor-pointer'
                >
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      </div>

          {editing && (
  <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-in-out">
    <div className="bg-white p-6 rounded-lg w-full max-w-md space-y-4">
      <input
        value={form.title}
        onChange={(e)=>setForm({...form,title:e.target.value})}
        placeholder="Title"
        className="w-full border p-2 rounded"
      />
      <textarea
        value={form.description}
        onChange={(e)=>setForm({...form,description:e.target.value})}
        placeholder="Description"
        className="w-full border p-2 rounded"
      />
      <input
        type="date"
        value={form.date}
        onChange={(e)=>setForm({...form,date:e.target.value})}
        placeholder="Date"
        className="w-full border p-2 rounded"
        max={today}
      />
      <input
        value={form.location}
        onChange={(e)=>setForm({...form,location:e.target.value})}
        placeholder="Location"
        className="w-full border p-2 rounded"
      />
      <input
        value={form.contact}
        onChange={(e)=>setForm({...form,contact:e.target.value})}
        placeholder="Contact"
        className="w-full border p-2 rounded"
        maxLength={10} pattern="[0-9]{10}"
      />
      <select
        value={form.type}
        onChange={(e)=>setForm({...form,type:e.target.value})}
        className="w-full border p-2 rounded"
      >
        <option value="">Select type</option>
        <option value="Lost">Lost</option>
        <option value="Found">Found</option>
      </select>

      <input
        type="file"
        accept="image/*"
        onChange={(e)=>setNewImage(e.target.files?.[0]||null)}
      />

      {(newImage || form.image) && (
        <div className="flex flex-col items-center space-y-2">
        <img
          src={newImage ? URL.createObjectURL(newImage) : form.image}
          alt="preview"
          className="h-32 w-full object-cover rounded"
        />
        <Button
      variant="destructive"
      onClick={() => {
        setNewImage(null);
        setForm({ ...form, image: "" });
      }}
      className="px-3 py-2 cursor-pointer"
    >
      Remove Image
    </Button>
    </div>
      )}

      <div className="flex justify-end space-x-2 pt-2">
        <Button variant="outline" onClick={()=>setediting(null)}
          className='px-3 py-2 cursor-pointer'>Cancel</Button>
        <Button onClick={saveEdit} className='px-3 py-2 cursor-pointer'>Save</Button>
      </div>
    </div>
  </div>
)}
      
        

    </div>

  )
}

export default Searchbar
