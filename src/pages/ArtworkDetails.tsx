// @ts-nocheck
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { ArrowLeft, Search, Sparkles, Calendar, Palette as PaletteIcon, Maximize2, MapPin, Download, Edit, Save, X, Upload, ChevronLeft, ChevronRight } from "lucide-react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import jsPDF from "jspdf";
import { Artwork } from "@/types";
import { OptimizedImage, OptimizedGallery } from "@/components/ui/optimized-image";
import { Dialog, DialogContent, DialogOverlay } from "@/components/ui/dialog";

export default function ArtworkDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [artwork, setArtwork] = useState<Artwork | null>(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>("");
  const [isEditing, setIsEditing] = useState(false);
  const [editedArtwork, setEditedArtwork] = useState<Artwork | null>(null);
  const [tagsString, setTagsString] = useState<string>("");
  const [saving, setSaving] = useState(false);
  const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
  const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);
  const [mainImageIndex, setMainImageIndex] = useState<number>(0);
  const [imagesToDelete, setImagesToDelete] = useState<string[]>([]);
  const [makeNextUploadMain, setMakeNextUploadMain] = useState<boolean>(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const [lightboxIndex, setLightboxIndex] = useState<number>(0);

  useEffect(() => {
    if (id) {
      fetchArtwork();
    }
  }, [id]);

  const fetchArtwork = async () => {
    try {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      setArtwork(data);
      setEditedArtwork(data);
      setTagsString(Array.isArray(data.tags) ? data.tags.join(", ") : "");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      navigate("/inventory");
    } finally {
      setLoading(false);
    }
  };

  const handleReverseImageSearch = () => {
    if (!artwork?.image_url) return;
    window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(artwork.image_url)}`, '_blank');
    toast({
      title: "Opening Google Lens",
      description: "Search for similar artworks in a new tab",
    });
  };

  const handleAiAnalysis = async () => {
    if (!artwork?.image_url) {
      toast({
        title: "No image available",
        description: "This artwork doesn't have an image to analyze",
        variant: "destructive",
      });
      return;
    }

    setAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke("analyze-artwork", {
        body: { imageUrl: artwork.image_url }
      });

      if (error) throw error;

      if (data.error) {
        throw new Error(data.error);
      }

      setAiAnalysis(data.analysis);
      toast({
        title: "Analysis Complete",
        description: "AI has analyzed your artwork",
      });
    } catch (error: any) {
      console.error("AI analysis error:", error);
      toast({
        title: "Analysis Failed",
        description: error.message || "Failed to analyze artwork",
        variant: "destructive",
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "bg-green-50 text-green-700 border-green-200";
      case "sold":
        return "bg-red-50 text-red-700 border-red-200";
      case "consigned":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "reserved":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";
      default:
        return "bg-slate-50 text-slate-600 border-slate-200";
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditedArtwork(artwork);
    setTagsString(Array.isArray(artwork?.tags) ? artwork.tags.join(", ") : "");
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
    setMainImageIndex(0);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditedArtwork(artwork);
    setTagsString(Array.isArray(artwork?.tags) ? artwork.tags.join(", ") : "");
    setNewImageFiles([]);
    setNewImagePreviews([]);
    setImagesToDelete([]);
    setMainImageIndex(0);
  };

  // Get all images for display (main + additional)
  const getAllImages = (): string[] => {
    if (!artwork) return [];
    const images: string[] = [];
    if (artwork.image_url) images.push(artwork.image_url);
    if (artwork.images && Array.isArray(artwork.images)) {
      images.push(...artwork.images);
    }
    return images;
  };

  // Get all images including new uploads for edit mode
  const getAllImagesForEdit = (): string[] => {
    if (!editedArtwork) return [];
    const images: string[] = [];
    
    // Combine existing images (main + additional)
    const existingImages: string[] = [];
    if (editedArtwork.image_url) {
      existingImages.push(editedArtwork.image_url);
    }
    if (editedArtwork.images && Array.isArray(editedArtwork.images)) {
      existingImages.push(...editedArtwork.images);
    }
    
    // Filter out deleted images
    const activeExistingImages = existingImages.filter(img => !imagesToDelete.includes(img));
    
    // Add existing images first, then new previews
    images.push(...activeExistingImages);
    images.push(...newImagePreviews);
    
    return images;
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const beforeCount = getAllImagesForEdit().length;
      setNewImageFiles(prevFiles => [...prevFiles, ...files]);
      
      // Create previews for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setNewImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });

      if (makeNextUploadMain) {
        setMainImageIndex(beforeCount);
        setMakeNextUploadMain(false);
      }
    }
  };

  const removeImage = (index: number) => {
    const allImages = getAllImagesForEdit();
    const imageToRemove = allImages[index];
    
    // If it's a new preview, remove from previews
    if (newImagePreviews.includes(imageToRemove)) {
      const previewIndex = newImagePreviews.indexOf(imageToRemove);
      setNewImagePreviews(prev => prev.filter((_, i) => i !== previewIndex));
      setNewImageFiles(prev => prev.filter((_, i) => i !== previewIndex));
    } else {
      // If it's an existing image, mark for deletion
      setImagesToDelete(prev => [...prev, imageToRemove]);
    }
    
    // Reset main image index if needed
    if (mainImageIndex >= allImages.length - 1) {
      setMainImageIndex(Math.max(0, mainImageIndex - 1));
    }
  };

  const setAsMainImage = (index: number) => {
    setMainImageIndex(index);
  };

  const openLightbox = (index: number) => {
    setLightboxIndex(index);
    setLightboxOpen(true);
  };

  const closeLightbox = () => {
    setLightboxOpen(false);
  };

  const allImagesForLightbox = getAllImages();

  const navigateLightbox = (direction: 'prev' | 'next') => {
    if (allImagesForLightbox.length === 0) return;
    
    if (direction === 'prev') {
      setLightboxIndex((prev) => (prev > 0 ? prev - 1 : allImagesForLightbox.length - 1));
    } else {
      setLightboxIndex((prev) => (prev < allImagesForLightbox.length - 1 ? prev + 1 : 0));
    }
  };

  // Keyboard navigation for lightbox
  useEffect(() => {
    if (!lightboxOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        closeLightbox();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        navigateLightbox('prev');
      } else if (e.key === 'ArrowRight') {
        e.preventDefault();
        navigateLightbox('next');
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightboxOpen, allImagesForLightbox.length]);

  const handleSaveEdit = async () => {
    if (!editedArtwork) return;

    setSaving(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Upload new images
      const uploadedImageUrls: string[] = [];
      if (newImageFiles.length > 0) {
        for (let i = 0; i < newImageFiles.length; i++) {
          const file = newImageFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("artwork-images")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("artwork-images")
            .getPublicUrl(fileName);

          uploadedImageUrls.push(publicUrl);
        }
      }

      // Build final images array
      const allImages = getAllImagesForEdit();
      const finalImages: string[] = [];
      
      // Separate existing images from new previews
      const existingImages: string[] = [];
      if (editedArtwork.image_url && !imagesToDelete.includes(editedArtwork.image_url)) {
        existingImages.push(editedArtwork.image_url);
      }
      if (editedArtwork.images && Array.isArray(editedArtwork.images)) {
        existingImages.push(...editedArtwork.images.filter(img => !imagesToDelete.includes(img)));
      }
      
      // Add existing images first
      finalImages.push(...existingImages);
      
      // Add new uploaded images
      finalImages.push(...uploadedImageUrls);

      // Determine main image and additional images
      // Calculate correct index: existing images first, then new uploads
      const existingCount = existingImages.length;
      let selectedMainIndex = mainImageIndex;
      
      // If mainImageIndex points to a new preview, adjust it
      if (mainImageIndex >= existingCount) {
        // It's a new image, map to uploaded URLs
        const previewIndex = mainImageIndex - existingCount;
        selectedMainIndex = existingCount + previewIndex;
      }
      
      let newMainImageUrl: string | null = null;
      let additionalImages: string[] = [];
      
      if (finalImages.length > 0) {
        // Ensure index is valid
        selectedMainIndex = Math.min(selectedMainIndex, finalImages.length - 1);
        newMainImageUrl = finalImages[selectedMainIndex];
        additionalImages = finalImages.filter((_, i) => i !== selectedMainIndex);
      }

      // Delete images from storage if needed
      if (imagesToDelete.length > 0) {
        for (const imageUrl of imagesToDelete) {
          // Extract path from URL - format is usually: {supabase_url}/storage/v1/object/public/artwork-images/{path}
          try {
            const urlParts = imageUrl.split('/artwork-images/');
            if (urlParts.length > 1) {
              const filePath = urlParts[1].split('?')[0];
              await supabase.storage
                .from("artwork-images")
                .remove([filePath]);
            }
          } catch (deleteError) {
            console.warn("Failed to delete image:", imageUrl, deleteError);
            // Continue even if deletion fails
          }
        }
      }

      // Check if status changed to "sold"
      const statusChangedToSold = artwork?.status !== "sold" && editedArtwork.status === "sold";

      const updateData: any = {
        title: editedArtwork.title,
        artist: editedArtwork.artist,
        description: editedArtwork.description,
        year: editedArtwork.year,
        medium: editedArtwork.medium,
        dimensions: editedArtwork.dimensions,
        location: editedArtwork.location,
        price: editedArtwork.price,
        tags: tagsString.split(",").map(t => t.trim()).filter(Boolean),
        purchase_price: editedArtwork.purchase_price,
        purchase_date: editedArtwork.purchase_date,
        payment_received_date: editedArtwork.payment_received_date,
        seller_name: editedArtwork.seller_name,
        seller_contact: editedArtwork.seller_contact,
        seller_document_type: editedArtwork.seller_document_type,
        buyer_name: editedArtwork.buyer_name,
        buyer_contact: editedArtwork.buyer_contact,
        buyer_document_type: editedArtwork.buyer_document_type,
        image_url: newMainImageUrl,
        images: additionalImages,
      };

      // If status changed to sold, set sale date
      if (statusChangedToSold) {
        updateData.sale_date = new Date().toISOString().split('T')[0];
        updateData.status = "sold";
      }

      const { error } = await supabase
        .from("artworks")
        .update(updateData)
        .eq("id", id);

      if (error) throw error;

      // Fetch updated artwork to get all fields
      const { data: updatedData, error: fetchError } = await supabase
        .from("artworks")
        .select("*")
        .eq("id", id)
        .single();

      if (fetchError) throw fetchError;

      // Update local state
      setArtwork(updatedData);
      setEditedArtwork(updatedData);
      setIsEditing(false);
      setNewImageFiles([]);
      setNewImagePreviews([]);
      setImagesToDelete([]);
      setMainImageIndex(0);

      if (statusChangedToSold) {
        toast({
          title: "Sale Recorded",
          description: "Artwork marked as sold and transaction created",
        });
      } else {
        toast({
          title: "Success",
          description: "Artwork updated successfully",
        });
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleExportPDF = async () => {
    if (!artwork) return;

    // Fetch complete artwork data including all fields
    const { data: fullArtwork, error } = await supabase
      .from("artworks")
      .select("*")
      .eq("id", id)
      .single();

    if (error || !fullArtwork) {
      toast({
        title: "Error",
        description: "Failed to fetch complete artwork data",
        variant: "destructive",
      });
      return;
    }

    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    let yPosition = 20;

    // Title
    doc.setFontSize(24);
    doc.setFont("helvetica", "bold");
    doc.text("Artwork Details", pageWidth / 2, yPosition, { align: "center" });
    yPosition += 15;

    // Artwork Title and Artist
    doc.setFontSize(18);
    doc.text(artwork.title, 20, yPosition);
    yPosition += 10;
    doc.setFontSize(14);
    doc.setFont("helvetica", "normal");
    doc.text(`by ${artwork.artist}`, 20, yPosition);
    yPosition += 15;

    // Description
    if (artwork.description) {
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Description:", 20, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      const descLines = doc.splitTextToSize(artwork.description, pageWidth - 40);
      doc.text(descLines, 20, yPosition);
      yPosition += descLines.length * 7 + 8;
    }

    // Details Section
    doc.setFont("helvetica", "bold");
    doc.text("Details:", 20, yPosition);
    yPosition += 7;
    doc.setFont("helvetica", "normal");

    if (artwork.year) {
      doc.text(`Year: ${artwork.year}`, 20, yPosition);
      yPosition += 7;
    }
    if (artwork.medium) {
      doc.text(`Medium: ${artwork.medium}`, 20, yPosition);
      yPosition += 7;
    }
    if (artwork.dimensions) {
      doc.text(`Dimensions: ${artwork.dimensions}`, 20, yPosition);
      yPosition += 7;
    }
    if (artwork.location) {
      doc.text(`Location: ${artwork.location}`, 20, yPosition);
      yPosition += 7;
    }
    doc.text(`Status: ${artwork.status}`, 20, yPosition);
    yPosition += 7;

    // Purchase Information
    yPosition += 5;
    doc.setFont("helvetica", "bold");
    doc.text("Purchase Information:", 20, yPosition);
    yPosition += 7;
    doc.setFont("helvetica", "normal");
    
    if (fullArtwork.purchase_price) {
      doc.text(`Purchase Price: $${fullArtwork.purchase_price.toLocaleString()}`, 20, yPosition);
      yPosition += 7;
    }
    if (fullArtwork.purchase_date) {
      doc.text(`Purchase Date: ${fullArtwork.purchase_date}`, 20, yPosition);
      yPosition += 7;
    }
    if (fullArtwork.seller_name) {
      doc.text(`Seller: ${fullArtwork.seller_name}`, 20, yPosition);
      yPosition += 7;
    }
    if (fullArtwork.seller_contact) {
      doc.text(`Seller Contact: ${fullArtwork.seller_contact}`, 20, yPosition);
      yPosition += 7;
    }
    if (fullArtwork.seller_document_type) {
      doc.text(`Seller Document: ${fullArtwork.seller_document_type}`, 20, yPosition);
      yPosition += 7;
    }

    // Sale Information (if sold)
    if (fullArtwork.buyer_name || fullArtwork.sale_date) {
      yPosition += 5;
      doc.setFont("helvetica", "bold");
      doc.text("Sale Information:", 20, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      
      if (artwork.price) {
        doc.text(`Sale Price: $${artwork.price.toLocaleString()}`, 20, yPosition);
        yPosition += 7;
      }
      if (fullArtwork.sale_date) {
        doc.text(`Sale Date: ${fullArtwork.sale_date}`, 20, yPosition);
        yPosition += 7;
      }
      if (fullArtwork.buyer_name) {
        doc.text(`Buyer: ${fullArtwork.buyer_name}`, 20, yPosition);
        yPosition += 7;
      }
      if (fullArtwork.buyer_contact) {
        doc.text(`Buyer Contact: ${fullArtwork.buyer_contact}`, 20, yPosition);
        yPosition += 7;
      }
      if (fullArtwork.buyer_document_type) {
        doc.text(`Buyer Document: ${fullArtwork.buyer_document_type}`, 20, yPosition);
        yPosition += 7;
      }
    }

    // Tags
    if (artwork.tags && Array.isArray(artwork.tags) && artwork.tags.length > 0) {
      yPosition += 5;
      doc.setFontSize(12);
      doc.setFont("helvetica", "bold");
      doc.text("Tags:", 20, yPosition);
      yPosition += 7;
      doc.setFont("helvetica", "normal");
      doc.text(artwork.tags.join(", "), 20, yPosition);
    }

    // Save PDF
    doc.save(`${artwork.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_details.pdf`);
    
    toast({
      title: "PDF Exported",
      description: "Artwork details have been exported successfully",
    });
  };

  if (loading) {
    return (
      <AuroraBackground>
        <div className="relative z-10 flex items-center justify-center min-h-screen">
          <div className="inline-flex items-center gap-3 text-slate-600">
            <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            Loading artwork...
          </div>
        </div>
      </AuroraBackground>
    );
  }

  if (!artwork) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-10 w-full max-w-7xl px-4 sm:px-6 py-6 sm:py-8 mx-auto"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-6 sm:mb-8 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto text-center sm:text-left">
            <Button
              variant="outline"
              onClick={() => navigate("/inventory")}
              className="rounded-full hover:bg-slate-100 w-full sm:w-auto"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Collection
            </Button>
            <h1 className="text-lg sm:text-2xl font-bold text-slate-800">
              {isEditing ? "Edit Artwork" : "Artwork Details"}
            </h1>
          </div>
          <div className="flex gap-2 sm:gap-3 w-full sm:w-auto">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  onClick={handleCancelEdit}
                  className="rounded-full flex-1 sm:flex-none"
                  disabled={saving}
                >
                  <X className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Cancel</span>
                </Button>
                <Button
                  variant="default"
                  onClick={handleSaveEdit}
                  className="rounded-full flex-1 sm:flex-none"
                  disabled={saving}
                >
                  <Save className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">{saving ? "Saving..." : "Save Changes"}</span>
                  <span className="sm:hidden">{saving ? "..." : "Save"}</span>
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={handleEdit}
                  className="rounded-full flex-1 sm:flex-none"
                >
                  <Edit className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Edit</span>
                </Button>
                <Button
                  variant="default"
                  onClick={handleExportPDF}
                  className="rounded-full flex-1 sm:flex-none"
                >
                  <Download className="h-4 w-4 sm:mr-2" />
                  <span className="hidden sm:inline">Export to PDF</span>
                  <span className="sm:hidden">PDF</span>
                </Button>
              </>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
          {/* Left Column - Image */}
          <Card className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
            {isEditing ? (
              <div className="space-y-4">
                {/* Image Gallery in Edit Mode */}
                {(() => {
                  const allImages = getAllImagesForEdit();
                  if (allImages.length === 0 && newImagePreviews.length === 0) {
                    return (
                      <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                        <Upload className="h-12 w-12 text-slate-400 mb-4" />
                        <p className="text-base font-medium text-slate-700 mb-1">Click to upload images</p>
                        <p className="text-sm text-slate-500">or drag and drop</p>
                        <p className="text-xs text-slate-400 mt-2">PNG, JPG, GIF up to 10MB each</p>
                        <input
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                      </label>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      {/* Main Image Display */}
                      {allImages.length > 0 && (
                        <div className="relative">
                          <OptimizedImage
                            src={allImages[mainImageIndex] || allImages[0]}
                            alt={editedArtwork?.title || "Artwork"}
                            size="detail"
                            aspectRatio="auto"
                            className="rounded-xl"
                            quality={95}
                            priority={true}
                            objectFit="contain"
                          />
                          {mainImageIndex < allImages.length && (
                            <div className="absolute top-2 left-2 bg-black/70 text-white px-2 py-1 rounded text-xs font-medium">
                              Main Image
                            </div>
                          )}
                          <div className="absolute top-2 right-2">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              className="rounded-full bg-white/90 hover:bg-white"
                              onClick={() => { setMakeNextUploadMain(true); (document.getElementById('edit-image-upload') as HTMLInputElement | null)?.click(); }}
                            >
                              <Upload className="h-4 w-4 mr-2" />
                              Change/Add Image
                            </Button>
                          </div>
                        </div>
                      )}
                      
                      {/* Thumbnail Grid */}
                      {allImages.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {allImages.map((image, index) => (
                            <div key={index} className="relative group">
                              <OptimizedImage
                                src={image}
                                alt={`Image ${index + 1}`}
                                size="thumbnail"
                                aspectRatio="square"
                                className={index === mainImageIndex ? "border-2 border-blue-500 rounded" : "border-2 border-transparent rounded"}
                              />
                              <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-1">
                                {index !== mainImageIndex && (
                                  <Button
                                    type="button"
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 text-white hover:bg-white/20"
                                    onClick={() => setAsMainImage(index)}
                                  >
                                    Set Main
                                  </Button>
                                )}
                                <Button
                                  type="button"
                                  variant="ghost"
                                  size="sm"
                                  className="h-8 text-white hover:bg-red-500"
                                  onClick={() => removeImage(index)}
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      
                      {/* Upload Button */}
                      <label>
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-full"
                          onClick={() => document.getElementById('edit-image-upload')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Change/Add Image
                        </Button>
                        <input
                          id="edit-image-upload"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  );
                })()}
              </div>
            ) : (
              <>
                {(() => {
                  const allImages = getAllImages();
                  if (allImages.length === 0) {
                    return (
                      <div className="aspect-square bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center rounded-xl">
                        <PaletteIcon className="h-24 w-24 text-slate-400" />
                      </div>
                    );
                  }
                  
                  if (allImages.length === 1) {
                    return (
                      <div className="space-y-4">
                        <OptimizedImage
                          src={allImages[0]}
                          alt={artwork.title}
                          size="detail"
                          aspectRatio="auto"
                          className="rounded-xl cursor-pointer"
                          quality={95}
                          priority={true}
                          objectFit="contain"
                          onClick={() => openLightbox(0)}
                        />
                        <div className="flex gap-3">
                          <Button
                            variant="default"
                            className="flex-1 rounded-full"
                            onClick={handleReverseImageSearch}
                          >
                            <Search className="h-4 w-4 mr-2" />
                            Find Similar (Google)
                          </Button>
                          <Button
                            variant="default"
                            className="flex-1 rounded-full"
                            onClick={handleAiAnalysis}
                            disabled={analyzing}
                          >
                            <Sparkles className="h-4 w-4 mr-2" />
                            {analyzing ? "Analyzing..." : "AI Analysis"}
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <div className="space-y-4">
                      <OptimizedGallery
                        images={allImages}
                        coverImageIndex={0}
                        onImageClick={(index) => openLightbox(index)}
                        quality={95}
                      />
                      <div className="flex gap-3">
                        <Button
                          variant="default"
                          className="flex-1 rounded-full"
                          onClick={handleReverseImageSearch}
                        >
                          <Search className="h-4 w-4 mr-2" />
                          Find Similar (Google)
                        </Button>
                        <Button
                          variant="default"
                          className="flex-1 rounded-full"
                          onClick={handleAiAnalysis}
                          disabled={analyzing}
                        >
                          <Sparkles className="h-4 w-4 mr-2" />
                          {analyzing ? "Analyzing..." : "AI Analysis"}
                        </Button>
                      </div>
                    </div>
                  );
                })()}
              </>
            )}

            {/* AI Analysis Results */}
            {aiAnalysis && (
              <Card className="mt-6 p-4 bg-gradient-to-br from-blue-50 to-purple-50 border border-blue-200">
                <h3 className="text-lg font-semibold text-slate-800 mb-3 flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-blue-600" />
                  AI Analysis
                </h3>
                <div className="text-sm text-slate-700 whitespace-pre-wrap leading-relaxed">
                  {aiAnalysis}
                </div>
              </Card>
            )}
          </Card>

          {/* Full Screen Lightbox */}
          <Dialog open={lightboxOpen} onOpenChange={(open) => !open && closeLightbox()}>
            <DialogContent 
              className="max-w-[100vw] max-h-[100vh] w-full h-full p-0 bg-black border-none [&>button]:hidden fixed inset-0 translate-x-0 translate-y-0"
              onInteractOutside={(e) => e.preventDefault()}
              onEscapeKeyDown={closeLightbox}
              onClick={(e) => {
                // Close on overlay click (but not on image click)
                if (e.target === e.currentTarget) {
                  closeLightbox();
                }
              }}
            >
              <div className="relative w-full h-full flex items-center justify-center min-h-[80vh]">
                {/* Close Button */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute top-4 right-4 z-50 text-white hover:bg-white/20 rounded-full"
                  onClick={closeLightbox}
                >
                  <X className="h-6 w-6" />
                </Button>

                {/* Previous Button */}
                {allImagesForLightbox.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute left-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
                    onClick={() => navigateLightbox('prev')}
                  >
                    <ChevronLeft className="h-8 w-8" />
                  </Button>
                )}

                {/* Next Button */}
                {allImagesForLightbox.length > 1 && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="absolute right-4 top-1/2 -translate-y-1/2 z-50 text-white hover:bg-white/20 rounded-full h-12 w-12"
                    onClick={() => navigateLightbox('next')}
                  >
                    <ChevronRight className="h-8 w-8" />
                  </Button>
                )}

                {/* Image Counter */}
                {allImagesForLightbox.length > 1 && (
                  <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-50 bg-black/60 text-white px-4 py-2 rounded-full text-sm">
                    {lightboxIndex + 1} / {allImagesForLightbox.length}
                  </div>
                )}

                {/* Main Image */}
                {allImagesForLightbox.length > 0 && (
                  <div className="relative w-full h-full flex items-center justify-center p-8">
                    <img
                      src={allImagesForLightbox[lightboxIndex]}
                      alt={`${artwork.title} - Image ${lightboxIndex + 1}`}
                      className="max-w-full max-h-[90vh] w-auto h-auto object-contain rounded-lg"
                      style={{
                        imageRendering: 'auto',
                        backfaceVisibility: 'hidden',
                        transform: 'translateZ(0)'
                      }}
                    />
                  </div>
                )}
              </div>
            </DialogContent>
          </Dialog>

          {/* Right Column - Details */}
          <div className="space-y-6">
            <Card className="bg-white border border-slate-200 rounded-2xl p-6 shadow-lg">
              {isEditing && editedArtwork ? (
                <div className="space-y-5">
                  <div>
                    <Label htmlFor="title" className="text-slate-700 font-semibold text-sm mb-1.5 block">Title *</Label>
                    <Input
                      id="title"
                      value={editedArtwork.title}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, title: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="artist" className="text-slate-700 font-semibold text-sm mb-1.5 block">Artist *</Label>
                    <Input
                      id="artist"
                      value={editedArtwork.artist}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, artist: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="description" className="text-slate-700 font-semibold text-sm mb-1.5 block">Description</Label>
                    <Textarea
                      id="description"
                      value={editedArtwork.description || ""}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, description: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      rows={4}
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="year" className="text-slate-700 font-semibold text-sm mb-1.5 block">Year</Label>
                      <Input
                        id="year"
                        type="number"
                        value={editedArtwork.year || ""}
                        onChange={(e) => setEditedArtwork({ ...editedArtwork, year: e.target.value ? parseInt(e.target.value) : null })}
                        className="bg-slate-50 border-slate-200 text-slate-900"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="price" className="text-slate-700 font-semibold text-sm mb-1.5 block">Price ($)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={editedArtwork.price || ""}
                        onChange={(e) => setEditedArtwork({ ...editedArtwork, price: e.target.value ? parseFloat(e.target.value) : null })}
                        className="bg-slate-50 border-slate-200 text-slate-900"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="medium" className="text-slate-700 font-semibold text-sm mb-1.5 block">Medium</Label>
                    <Input
                      id="medium"
                      value={editedArtwork.medium || ""}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, medium: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="dimensions" className="text-slate-700 font-semibold text-sm mb-1.5 block">Dimensions</Label>
                    <Input
                      id="dimensions"
                      value={editedArtwork.dimensions || ""}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, dimensions: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="e.g., 24 x 36 inches"
                    />
                  </div>

                  <div>
                    <Label htmlFor="location" className="text-slate-700 font-semibold text-sm mb-1.5 block">Location</Label>
                    <Input
                      id="location"
                      value={editedArtwork.location || ""}
                      onChange={(e) => setEditedArtwork({ ...editedArtwork, location: e.target.value })}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                    />
                  </div>

                  <div>
                    <Label htmlFor="tags" className="text-slate-900 font-semibold text-sm mb-1.5 block">Tags (comma-separated)</Label>
                    <Input
                      id="tags"
                      value={tagsString}
                      onChange={(e) => setTagsString(e.target.value)}
                      className="bg-slate-50 border-slate-200 text-slate-900"
                      placeholder="abstract, modern, colorful"
                    />
                  </div>

                  {/* Commercial Info Section */}
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-base font-semibold text-slate-800 mb-3">Commercial Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="purchase_price" className="text-slate-700 font-semibold text-sm mb-1.5 block">Purchase Price ($)</Label>
                        <Input
                          id="purchase_price"
                          type="number"
                          step="0.01"
                          value={editedArtwork.purchase_price || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, purchase_price: e.target.value ? parseFloat(e.target.value) : null })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="purchase_date" className="text-slate-700 font-semibold text-sm mb-1.5 block">Purchase Date</Label>
                        <Input
                          id="purchase_date"
                          type="date"
                          value={editedArtwork.purchase_date || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, purchase_date: e.target.value || null })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="payment_received_date" className="text-slate-700 font-semibold text-sm mb-1.5 block">Payment Received</Label>
                        <Input
                          id="payment_received_date"
                          type="date"
                          value={editedArtwork.payment_received_date || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, payment_received_date: e.target.value || null })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Seller Information */}
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-base font-semibold text-slate-800 mb-3">Seller Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="seller_name" className="text-slate-700 font-semibold text-sm mb-1.5 block">Seller Name</Label>
                        <Input
                          id="seller_name"
                          value={editedArtwork.seller_name || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, seller_name: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="seller_contact" className="text-slate-700 font-semibold text-sm mb-1.5 block">Seller Contact</Label>
                        <Input
                          id="seller_contact"
                          value={editedArtwork.seller_contact || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, seller_contact: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="seller_document_type" className="text-slate-700 font-semibold text-sm mb-1.5 block">Seller Document Type</Label>
                        <Input
                          id="seller_document_type"
                          value={editedArtwork.seller_document_type || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, seller_document_type: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="passport, ID, etc."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Buyer Information */}
                  <div className="pt-4 border-t border-slate-200">
                    <h3 className="text-base font-semibold text-slate-800 mb-3">Buyer Information</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="buyer_name" className="text-slate-700 font-semibold text-sm mb-1.5 block">Buyer Name</Label>
                        <Input
                          id="buyer_name"
                          value={editedArtwork.buyer_name || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, buyer_name: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyer_contact" className="text-slate-700 font-semibold text-sm mb-1.5 block">Buyer Contact</Label>
                        <Input
                          id="buyer_contact"
                          value={editedArtwork.buyer_contact || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, buyer_contact: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                        />
                      </div>
                      <div>
                        <Label htmlFor="buyer_document_type" className="text-slate-700 font-semibold text-sm mb-1.5 block">Buyer Document Type</Label>
                        <Input
                          id="buyer_document_type"
                          value={editedArtwork.buyer_document_type || ""}
                          onChange={(e) => setEditedArtwork({ ...editedArtwork, buyer_document_type: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="passport, ID, etc."
                        />
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-start justify-between mb-6">
                    <div>
                      <h2 className="text-3xl font-bold text-slate-800 mb-2">{artwork.title}</h2>
                      <p className="text-xl text-slate-600">{artwork.artist}</p>
                    </div>
                    <Badge className={`${getStatusColor(artwork.status)} text-sm font-medium px-4 py-2`}>
                      {artwork.status}
                    </Badge>
                  </div>

                  {artwork.description && (
                    <div className="mb-6">
                      <h3 className="text-sm font-semibold text-slate-700 mb-2">Description</h3>
                      <p className="text-slate-600 leading-relaxed">{artwork.description}</p>
                    </div>
                  )}

              <div className="grid grid-cols-2 gap-4 mb-6">
                {artwork.year && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Calendar className="h-4 w-4" />
                      Year
                    </div>
                    <p className="text-slate-800 font-medium">{artwork.year}</p>
                  </div>
                )}
                {artwork.medium && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <PaletteIcon className="h-4 w-4" />
                      Medium
                    </div>
                    <p className="text-slate-800 font-medium">{artwork.medium}</p>
                  </div>
                )}
                {artwork.dimensions && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <Maximize2 className="h-4 w-4" />
                      Dimensions
                    </div>
                    <p className="text-slate-800 font-medium">{artwork.dimensions}</p>
                  </div>
                )}
                {artwork.location && (
                  <div>
                    <div className="flex items-center gap-2 text-sm text-slate-500 mb-1">
                      <MapPin className="h-4 w-4" />
                      Location
                    </div>
                    <p className="text-slate-800 font-medium">{artwork.location}</p>
                  </div>
                )}
              </div>

              {artwork.price && (
                <div className="mb-6 p-4 bg-slate-50 rounded-xl">
                  <p className="text-sm text-slate-500 mb-1">Price</p>
                  <p className="text-3xl font-bold text-slate-800">${artwork.price.toLocaleString()}</p>
                </div>
              )}

                  {artwork.tags && Array.isArray(artwork.tags) && artwork.tags.length > 0 && (
                    <div>
                      <h3 className="text-sm font-semibold text-slate-700 mb-3">Tags</h3>
                      <div className="flex flex-wrap gap-2">
                        {artwork.tags.map((tag) => (
                          <Badge key={tag} variant="outline" className="border-slate-200 text-slate-600">
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </>
              )}
            </Card>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
