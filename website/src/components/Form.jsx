'use client'
import React from 'react'
import Searchbar from "@/components/Searchbar";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { X } from "lucide-react";
import { createClient } from "@/utils/supabase/client";

const supabase = createClient();

const Form = () => {
    const [showform, setshowform] = useState(false)
    const [refreshKey, setRefreshKey] = useState(0);
    
      const [formdata,setformdata]=useState({
        title: "",
        description: "",
        date:"",
        location: "",
        contact: "",
        type: ""
      })
      const [image, setImage] = useState(null);
      const [newErrors, setErrors] = useState({});

      
      

    const validateForm = () => {
    
    if (!formdata.title.trim()) newErrors.title = "Title is required";
    if (!formdata.description.trim()) newErrors.description = "Description is required";
    if (!formdata.date) newErrors.date = "Date is required";
    if (!formdata.location.trim()) newErrors.location = "Location is required";
    if (!formdata.contact.trim()) newErrors.contact = "Contact is required";
    if (!formdata.type) newErrors.type = "Type is required";
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
    
      const handleChange=(e)=>{
        setformdata({...formdata,[e.target.name]:e.target.value})
      }
    
      const handleImageChange=(e)=>{
        setImage(e.target.files[0]);
      }
    
      const handleSubmit=async (e)=>{
        e.preventDefault();

        if (!validateForm()) {
            alert("Please fill in all required fields");
            return;
        }

        let imageUrl=null;

        if(image){
            const ext=image.name.split('.').pop();

            const fileName=`${formdata.title}-${Date.now()}.${ext}`;

            const {error:uploadError} =await supabase
                .storage
                .from("images")
                .upload(fileName, image)

            if(uploadError){
                console.error("Upload failed:", uploadError.message);
                return;
            }

            const {data:publicUrlData} = supabase
                .storage
                .from("images")
                .getPublicUrl(fileName)

            imageUrl=publicUrlData.publicUrl;
        }
        if(!image){
            imageUrl="https://tdmwjbmcgnphefdysjao.supabase.co/storage/v1/object/public/images/images.png";
        }
            const {error}=await supabase
                .from("items")
                .insert({
                    title: formdata.title,
                    description: formdata.description,
                    date: formdata.date,
                    location: formdata.location,
                    contact: formdata.contact,
                    type: formdata.type,
                    image: imageUrl
                })

            if(error){
                console.error("Error inserting item:", error.message);
                return;
            }
            else {
                console.log("Item added successfully!");
                setformdata({ title: "", description: "", date: "", location: "", contact: "", type: "" });
                setImage(null);
                setshowform(false);
                setRefreshKey(prev => !prev);
            }
        
        }

  return (
    <div>
      <nav className='flex justify-between p-4 bg-gray-800 text-white'>
            <div className='p-1 select-none'>Campus Lost and Found</div>

            <Button onClick={()=>setshowform(true)} className="rounded p-3 cursor-pointer ">Add item</Button>

      </nav>

      
      
    <Searchbar refreshKey={refreshKey} />
     
    {showform && (
      <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center transition-all duration-300 ease-in-out">
      <div className="max-w-md w-full mx-auto mt-12 bg-slate-100 rounded-lg shadow transition hover:shadow-lg p-6 ">
        <Button onClick={()=>setshowform(false)} className="ml-auto mb-2 block cursor-pointer"><X /></Button>

        <form onSubmit={handleSubmit} className="flex flex-col p-3 space-y-4 " >
          <input type="text" placeholder="title" name="title" value={formdata.title} onChange={handleChange}
          className="w-full border bg-white border-slate-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-400" required/>
          
          <textarea name="description" placeholder="description" id="description" value={formdata.description} onChange={handleChange}
          className=" bg-white w-full border border-slate-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-400" required></textarea>

            <select
                name="type"
                value={formdata.type}
                onChange={handleChange}
                required
                className="border p-2 rounded bg-white"  
              >
                <option value="">Select type</option>
                <option value="Lost">Lost</option>
                <option value="Found">Found</option>
            </select>

          <input type="date" name="date" value={formdata.date} onChange={handleChange} max={new Date().toISOString().split('T')[0]}
          className="w-full border border-slate-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white" required/>

          <input type="text" placeholder="location" name="location" value={formdata.location} onChange={handleChange} 
          className="w-full border border-slate-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white" required/>

          <input type="text" placeholder="Contact" name="contact" value={formdata.contact} 
          onChange={handleChange}

          className="w-full border border-slate-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white" required maxLength={10} pattern="[0-9]{10}"/>

          <input type="file" accept="image/*" onChange={handleImageChange} className="border border-slate-300 rounded px-3 py-1 focus:outline-none focus:ring-2 focus:ring-slate-400 bg-white" />

        <div className="flex justify-evenly space-x-2">
          <Button onClick={()=>setshowform(false)} className="bg-slate-600 text-white cursor-pointer">Cancel</Button>
          <Button type="submit" onClick={handleSubmit} className="bg-slate-600 text-white cursor-pointer">Save</Button>
        </div>
        </form>


      </div>
      </div>
    )}


     
      
    </div>
  )
}

export default Form
