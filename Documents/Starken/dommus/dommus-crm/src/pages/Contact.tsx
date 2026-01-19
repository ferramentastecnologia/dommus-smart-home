import React, { useState } from 'react';
import { supabase } from "@/services/supabase/client";

const Contact = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    company: '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      // Get the default status
      const { data: defaultStatus, error: statusError } = await supabase
        .from('lead_statuses')
        .select('id')
        .eq('is_default', true)
        .single();

      if (statusError) throw new Error('Failed to get default status');

      // Create the lead
      const { error: leadError } = await supabase
        .from('leads')
        .insert([
          {
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            address: formData.address,
            company: formData.company,
            status_id: defaultStatus.id,
            source: 'Contact Form',
          }
        ]);

      if (leadError) throw leadError;

      alert("Your information has been submitted successfully!");

      // Reset form
      setFormData({
        name: '',
        email: '',
        phone: '',
        address: '',
        company: '',
      });
    } catch (error) {
      console.error('Error submitting form:', error);
      alert("There was a problem submitting your information. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container p-8 min-h-screen flex items-center justify-center bg-gray-100">
      <div className="w-full max-w-2xl mx-auto bg-white p-8 rounded shadow">
        <h1 className="text-2xl font-bold mb-6 text-gray-800">Contact Us</h1>
        <p className="mb-6 text-gray-600">Fill out the form below and we'll get back to you as soon as possible.</p>
        
        <form className="space-y-4" onSubmit={handleSubmit}>
          <div>
            <label className="block mb-1 font-medium">Name</label>
            <input 
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="John Doe"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Email</label>
            <input 
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="john@example.com"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Phone</label>
            <input 
              type="tel"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="+1 (555) 000-0000"
              required
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Address</label>
            <input 
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="123 Main St, City, Country"
            />
          </div>
          
          <div>
            <label className="block mb-1 font-medium">Company</label>
            <input 
              type="text"
              name="company"
              value={formData.company}
              onChange={handleChange}
              className="w-full px-3 py-2 border rounded"
              placeholder="Company Name"
            />
          </div>
          
          <button 
            type="submit"
            className="w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Submitting..." : "Submit"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Contact; 