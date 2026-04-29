import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { SectionHeader } from "@/components/ui/section-header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeft, Upload, X, Search, Save } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/ui/language-toggle";

export default function AddArtwork() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [imagePreviews, setImagePreviews] = useState<string[]>([]);
  
  const [formData, setFormData] = useState({
    numero_de_police: "",
    inventoryNumber: "",
    title: "",
    artistOrObject: "",
    nationalityOrOrigin: "",
    description: "",
    tags: "",
    year: "",
    medium: "",
    dimensions: "",
    prixAchat: "",
    datePaiementAchat: "",
    price: "",
    location: "",
    status: "available",
    sellerName: "",
    sellerContact: "",
    sellerDocumentType: "",
    buyerName: "",
    buyerContact: "",
    buyerDocumentType: "",
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      setImageFiles(prevFiles => [...prevFiles, ...files]);
      
      // Create previews for new files
      files.forEach(file => {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreviews(prev => [...prev, reader.result as string]);
        };
        reader.readAsDataURL(file);
      });
    }
  };

  const removeImage = (index: number) => {
    setImageFiles(prev => prev.filter((_, i) => i !== index));
    setImagePreviews(prev => prev.filter((_, i) => i !== index));
  };

  const handleReverseImageSearch = async () => {
    if (imageFiles.length === 0) return;

    try {
      // Upload first image to temporary storage for reverse search
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      const fileExt = imageFiles[0].name.split(".").pop();
      const fileName = `${user.id}/temp_${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from("artwork-images")
        .upload(fileName, imageFiles[0]);

      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage
        .from("artwork-images")
        .getPublicUrl(fileName);

      // Open Google Lens with the image URL
      window.open(`https://lens.google.com/uploadbyurl?url=${encodeURIComponent(publicUrl)}`, '_blank');

      toast({
        title: "Opening Google Lens",
        description: "Search for similar artworks in a new tab",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to initiate reverse image search",
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      let imageUrl = null;
      let additionalImages: string[] = [];

      // Upload all images if selected
      if (imageFiles.length > 0) {
        for (let i = 0; i < imageFiles.length; i++) {
          const file = imageFiles[i];
          const fileExt = file.name.split(".").pop();
          const fileName = `${user.id}/${Date.now()}_${i}.${fileExt}`;
          
          const { error: uploadError } = await supabase.storage
            .from("artwork-images")
            .upload(fileName, file);

          if (uploadError) throw uploadError;

          const { data: { publicUrl } } = supabase.storage
            .from("artwork-images")
            .getPublicUrl(fileName);

          // First image is the main image
          if (i === 0) {
            imageUrl = publicUrl;
          } else {
            additionalImages.push(publicUrl);
          }
        }
      }

      // Insert artwork
      const { error: insertError } = await supabase
        .from("artworks")
        .insert({
          user_id: user.id,
          title: formData.title,
          artist: formData.artistOrObject,
          description: formData.description || null,
          tags: formData.tags ? formData.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0) : [],
          year: formData.year ? parseInt(formData.year) : null,
          medium: formData.medium || null,
          dimensions: formData.dimensions || null,
          price: formData.price ? parseFloat(formData.price) : null,
          location: formData.location || null,
          status: formData.status,
          image_url: imageUrl,
          images: additionalImages,
          seller_name: formData.sellerName || null,
          seller_contact: formData.sellerContact || null,
          seller_document_type: formData.sellerDocumentType || null,
          buyer_name: formData.buyerName || null,
          buyer_contact: formData.buyerContact || null,
          buyer_document_type: formData.buyerDocumentType || null,
          purchase_price: formData.prixAchat ? parseFloat(formData.prixAchat) : null,
          purchase_date: new Date().toISOString().split('T')[0],
        });

      if (insertError) throw insertError;

      toast({
        title: "Success!",
        description: "Artwork added successfully.",
      });

      navigate("/inventory");
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuroraBackground>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageToggle />
      </div>
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="relative z-10 w-full max-w-8xl mobile-container py-6 sm:py-12 mx-auto safe-top safe-bottom"
      >
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-center justify-between mb-8 sm:mb-12 gap-4">
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto text-center sm:text-left">
            <Button
              variant="outline"
              onClick={() => navigate("/inventory")}
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 w-full sm:w-auto tap-target"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("addArtwork.back")}
            </Button>
            <div className="w-full sm:w-auto">
              <h1 className="text-2xl sm:text-4xl font-bold text-slate-800 mb-2">{t("addArtwork.title")}</h1>
              <p className="text-sm sm:text-base text-slate-600">
                {t("addArtwork.subtitle")}
              </p>
            </div>
          </div>
          
          {/* Action Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto justify-center sm:justify-end">
            <Button
              type="submit"
              form="add-artwork-form"
              disabled={loading}
              variant="outline"
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition tap-target"
            >
              <Save className="h-4 w-4 mr-2" />
              {loading ? t("addArtwork.saving") : t("addArtwork.save")}
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => navigate("/inventory")}
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 transition tap-target"
            >
              {t("addArtwork.cancel")}
            </Button>
          </div>
        </div>

        <div className="space-y-4 sm:space-y-6">
          {/* Image Upload Card */}
          <Card>
            <SectionHeader 
              title={t("addArtwork.sections.images.title")} 
              subtitle={t("addArtwork.sections.images.subtitle")}
            />
                
                {/* Image Previews Grid */}
                {imagePreviews.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 gap-4">
                      {imagePreviews.map((preview, index) => (
                        <div key={index} className="relative group">
                          <img
                            src={preview}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-48 object-cover rounded-lg border border-slate-200"
                          />
                          <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            className="absolute top-2 right-2 rounded-full bg-white/90 hover:bg-white border border-slate-200 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeImage(index)}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                          {index === 0 && (
                            <div className="absolute top-2 left-2 bg-black text-white px-2 py-1 rounded text-xs font-medium">
                              Main Image
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                    <div className="flex gap-3">
                      <Button
                        type="button"
                        variant="outline"
                        className="flex-1 rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
                        onClick={handleReverseImageSearch}
                      >
                        <Search className="h-4 w-4 mr-2" />
                        Find Similar
                      </Button>
                      <label className="flex-1">
                        <Button
                          type="button"
                          variant="outline"
                          className="w-full rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
                          onClick={() => document.getElementById('additional-images')?.click()}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Add More
                        </Button>
                        <input
                          id="additional-images"
                          type="file"
                          className="hidden"
                          accept="image/*"
                          multiple
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                ) : (
                  <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-slate-300 rounded-lg cursor-pointer hover:bg-slate-50 transition-colors">
                    <Upload className="h-12 w-12 text-slate-400 mb-4" />
                    <p className="text-base font-medium text-slate-700 mb-1">Click to upload</p>
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
                )}
          </Card>

          {/* Form Fields */}
          <form id="add-artwork-form" onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information Card */}
            <Card>
              <SectionHeader 
                title={t("addArtwork.sections.basicInfo.title")} 
                subtitle={t("addArtwork.sections.basicInfo.subtitle")}
              />
              <div className="space-y-4">
                    {/* Police Number - First and most important field */}
                    <div className="space-y-2">
                      <Label htmlFor="numero_de_police" className="text-slate-700 font-semibold text-sm mb-1.5 block">
                        Numéro de police <span className="text-red-500">*</span>
                      </Label>
                      <Input
                        id="numero_de_police"
                        value={formData.numero_de_police}
                        onChange={(e) => setFormData({ ...formData, numero_de_police: e.target.value })}
                        required
                        className="bg-slate-50 border-slate-200 text-slate-900 w-full min-w-0"
                        placeholder="Enter police number"
                      />
                    </div>
                    
                    <div className="grid-mobile">
                      <div className="space-y-2">
                        <Label htmlFor="title" className="text-slate-700 font-semibold text-sm mb-1.5 block">
                          {t("addArtwork.sections.basicInfo.titleLabel")} <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          required
                          className="bg-slate-50 border-slate-200 text-slate-900 w-full min-w-0"
                          placeholder="Enter artwork title"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="artistOrObject" className="text-slate-700 font-semibold text-sm mb-1.5 block">
                          Artist/Object <span className="text-red-500">*</span>
                        </Label>
                        <Input
                          id="artistOrObject"
                          value={formData.artistOrObject}
                          onChange={(e) => setFormData({ ...formData, artistOrObject: e.target.value })}
                          required
                          className="bg-slate-50 border-slate-200 text-slate-900 w-full min-w-0"
                          placeholder="Enter artist or object name"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="description" className="text-slate-700 font-semibold text-sm mb-1.5 block">
                        Description
                      </Label>
                      <Textarea
                        id="description"
                        value={formData.description}
                        onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                        className="bg-slate-50 border-slate-200 text-slate-900 w-full min-w-0"
                        placeholder="Describe the artwork..."
                      />
                    </div>
              </div>
            </Card>

            {/* Artwork Details Card */}
            <Card>
              <SectionHeader 
                title="Artwork Details" 
                subtitle="Technical specifications and categorization"
              />
              <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="year" className="text-slate-700 font-semibold text-sm mb-1.5 block">Year</Label>
                        <Input
                          id="year"
                          type="number"
                          value={formData.year}
                          onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="e.g., 2023"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="medium" className="text-slate-700 font-semibold text-sm mb-1.5 block">Medium</Label>
                        <Input
                          id="medium"
                          value={formData.medium}
                          onChange={(e) => setFormData({ ...formData, medium: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="e.g., Oil on canvas"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="dimensions" className="text-slate-700 font-semibold text-sm mb-1.5 block">Dimensions</Label>
                        <Input
                          id="dimensions"
                          value={formData.dimensions}
                          onChange={(e) => setFormData({ ...formData, dimensions: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="e.g., 24x36 inches"
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="tags" className="text-slate-700 font-semibold text-sm mb-1.5 block">Tags</Label>
                      <Input
                        id="tags"
                        value={formData.tags}
                        onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
                        placeholder="abstract, oil, modern"
                        className="bg-slate-50 border-slate-200 text-slate-900"
                      />
                      <p className="text-xs text-slate-500">Separate tags with commas</p>
                    </div>
              </div>
            </Card>

            {/* Commercial Information Card */}
            <Card>
              <SectionHeader 
                title="Commercial Information" 
                subtitle="Pricing, status, and location details"
              />
              <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="price" className="text-slate-700 font-semibold text-sm mb-1.5 block">Selling Price</Label>
                        <Input
                          id="price"
                          type="number"
                          step="0.01"
                          value={formData.price}
                          onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="prixAchat" className="text-slate-700 font-semibold text-sm mb-1.5 block">Purchase Price</Label>
                        <Input
                          id="prixAchat"
                          type="number"
                          step="0.01"
                          value={formData.prixAchat}
                          onChange={(e) => setFormData({ ...formData, prixAchat: e.target.value })}
                          className="bg-slate-50 border-slate-200 text-slate-900"
                          placeholder="0.00"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="status" className="text-slate-700 font-semibold text-sm mb-1.5 block">Status</Label>
                        <Select
                          value={formData.status}
                          onValueChange={(value) => setFormData({ ...formData, status: value })}
                        >
                        <SelectTrigger className="bg-slate-50 border-slate-200 text-slate-900">
                          <SelectValue />
                        </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="available">Available</SelectItem>
                            <SelectItem value="sold">Sold</SelectItem>
                            <SelectItem value="consigned">Consigned</SelectItem>
                            <SelectItem value="reserved">Reserved</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="location" className="text-slate-700 font-semibold text-sm mb-1.5 block">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                        className="bg-slate-50 border-slate-200 text-slate-900"
                        placeholder="Where is the artwork stored?"
                      />
                    </div>
              </div>
            </Card>
          </form>
        </div>
      </motion.div>
    </AuroraBackground>
  );
}
