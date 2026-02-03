"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabase";
import Image from "next/image";

export default function NewProductPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        price_inr: "",
        price_usd: "",
        category: "Silk",
        description: "",
        images: [] as string[],
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!e.target.files || e.target.files.length === 0) return;

        try {
            setUploading(true);
            const files = Array.from(e.target.files);
            const newImageUrls: string[] = [];

            for (const file of files) {
                const fileExt = file.name.split('.').pop();
                const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`;
                const filePath = `${fileName}`;

                // Upload
                const { error: uploadError } = await supabase.storage
                    .from('product-images')
                    .upload(filePath, file);

                if (uploadError) throw uploadError;

                // Get Public URL
                const { data } = supabase.storage
                    .from('product-images')
                    .getPublicUrl(filePath);

                newImageUrls.push(data.publicUrl);
            }

            setFormData(prev => ({ ...prev, images: [...prev.images, ...newImageUrls] }));
        } catch (error) {
            console.error('Error uploading image:', error);
            alert('Error uploading image!');
        } finally {
            setUploading(false);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setFormData(prev => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove)
        }));
    };

    function generateSlug(name: string) {
        return name
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-+|-+$/g, "");
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            const slug = generateSlug(formData.name);

            const { error } = await supabase.from("products").insert({
                name: formData.name,
                slug: slug,
                price_inr: parseFloat(formData.price_inr),
                price_usd: parseFloat(formData.price_usd),
                category: formData.category,
                description: formData.description,
                images: formData.images,
                in_stock: true,
                featured: false,
                best_seller: false
            });

            if (error) throw error;

            alert("Product added successfully!");
            router.push("/admin/dashboard");
        } catch (error) {
            console.error("Error adding product:", error);
            alert("Error adding product. Please check console.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-2xl">
                <Link href="/admin/dashboard" className="text-gray-500 hover:text-gray-900 mb-6 inline-block">
                    ← Back to Dashboard
                </Link>

                <h1 className="text-3xl font-heading font-bold text-gray-900 mb-8">Add New Product</h1>

                <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-100">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Name</label>
                            <input
                                type="text"
                                name="name"
                                required
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                value={formData.name}
                                onChange={handleChange}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (INR)</label>
                                <input
                                    type="number"
                                    name="price_inr"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.price_inr}
                                    onChange={handleChange}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Price (USD)</label>
                                <input
                                    type="number"
                                    name="price_usd"
                                    required
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                    value={formData.price_usd}
                                    onChange={handleChange}
                                />
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                            <select
                                name="category"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                value={formData.category}
                                onChange={handleChange}
                            >
                                <option value="Silk">Silk</option>
                                <option value="Cotton">Cotton</option>
                                <option value="Party Wear">Party Wear</option>
                                <option value="Bridal">Bridal</option>
                                <option value="Daily Wear">Daily Wear</option>
                                <option value="Sarees">Sarees</option>
                                <option value="Lehengas">Lehengas</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                            <textarea
                                name="description"
                                required
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-primary focus:border-primary"
                                value={formData.description}
                                onChange={handleChange}
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Product Images</label>

                            {/* Preview Grid */}
                            {formData.images.length > 0 && (
                                <div className="grid grid-cols-3 gap-4 mb-4">
                                    {formData.images.map((url, index) => (
                                        <div key={index} className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                            <Image
                                                src={url}
                                                alt={`Preview ${index}`}
                                                fill
                                                className="object-cover"
                                            />
                                            <button
                                                type="button"
                                                onClick={() => removeImage(index)}
                                                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-md hover:bg-gray-100 text-red-500"
                                            >
                                                ✕
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:bg-gray-50 transition-colors">
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                    disabled={uploading}
                                    className="hidden"
                                    id="image-upload"
                                />
                                <label
                                    htmlFor="image-upload"
                                    className="cursor-pointer flex flex-col items-center"
                                >
                                    <span className="text-gray-500 mb-2">
                                        {uploading ? "Uploading..." : "Click to upload images"}
                                    </span>
                                    <span className="text-xs text-gray-400">Select multiple files supported</span>
                                </label>
                            </div>
                        </div>

                        <div className="pt-4">
                            <button
                                type="submit"
                                disabled={loading || uploading || formData.images.length === 0}
                                className="w-full bg-gray-900 hover:bg-black text-white font-bold py-3 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {loading ? "Saving..." : "Save Product"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
