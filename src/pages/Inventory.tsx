// @ts-nocheck
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Search, Plus, MoreVertical, Pencil, Trash, Calendar, Palette, Upload } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "@/components/ui/language-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { AuroraBackground } from "@/components/ui/aurora-background";
import { Artwork } from "@/types";
import { ImportWizard } from "@/components/import/ImportWizard";
import { ExportButton } from "@/components/import/ExportButton";
import { HowItWorksModal } from "@/components/ui/how-it-works-modal";
import { OptimizedImage } from "@/components/ui/optimized-image";
import {
  DndContext,
  DragOverlay,
  DragStartEvent,
  DragEndEvent,
  DragOverEvent,
  useSensor,
  useSensors,
  PointerSensor,
  closestCenter,
  useDroppable,
  useDraggable,
} from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";

// Helper functions
const getStatusVariant = (status: string) => {
  switch (status) {
    case "sold":
      return "destructive";
    case "consigned":
      return "default";
    case "available":
      return "secondary";
    case "reserved":
      return "outline";
    default:
      return "outline";
  }
};

const getStatusTagStyle = (tag: string) => {
  switch (tag) {
    case "sold":
      return "bg-red-500/80 text-white border-red-300";
    case "consigned":
      return "bg-blue-500/80 text-white border-blue-300";
    case "available":
      return "bg-green-500/80 text-white border-green-300";
    case "reserved":
      return "bg-yellow-500/80 text-white border-yellow-300";
    default:
      return "bg-black/60 text-white border-white/20";
  }
};

// Droppable Artwork Card Component
function DroppableArtworkCard({ artwork, index, onEdit, onDelete }: {
  artwork: Artwork;
  index: number;
  onEdit: (artwork: Artwork) => void;
  onDelete: (id: string) => void;
}) {
  const navigate = useNavigate();
  const { isOver, setNodeRef } = useDroppable({
    id: `artwork-${artwork.id}`,
  });

  // Check if artwork has "exhibition" tag
  const hasExhibitionTag = artwork.tags && Array.isArray(artwork.tags) && artwork.tags.includes('exhibition');

  return (
    <motion.div
      ref={setNodeRef}
      key={artwork.id}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="h-full"
    >
      <Card 
        className={`group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer relative h-full flex flex-col ${
          isOver ? 'ring-2 ring-blue-500 ring-opacity-50 bg-blue-50' : ''
        } ${hasExhibitionTag ? 'exhibition-card' : ''}`}
        onClick={() => navigate(`/inventory/${artwork.id}`)}
      >
        {/* Image */}
        <div className="relative overflow-hidden bg-slate-100">
          <OptimizedImage
            src={artwork.image_url}
            alt={artwork.title}
            size="card"
            aspectRatio="auto"
            className="transition-transform duration-300"
            quality={95} // Very high quality for artwork images
            objectFit="contain" // Preserve original resolution/ratio without cropping
            priority={index < 12} // Prioritize first 12 images for faster initial load
          />
          
          {/* Drop indicator */}
          {isOver && (
            <div className="absolute inset-0 bg-blue-500 bg-opacity-20 flex items-center justify-center">
              <div className="bg-blue-500 text-white px-4 py-2 rounded-lg text-sm font-medium">
                Drop tag here
              </div>
            </div>
          )}

          {/* Tags overlay - includes status */}
          {((artwork.tags && Array.isArray(artwork.tags) && artwork.tags.length > 0) || artwork.status) && (
            <div className="absolute bottom-3 left-3 right-3 z-10 flex flex-wrap gap-2">
              {/* Show status as first tag if it exists */}
              {artwork.status && (
                <div
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md ${getStatusTagStyle(artwork.status)}`}
                >
                  {artwork.status}
                </div>
              )}
              
              {/* Show other tags (excluding status tags) */}
              {artwork.tags && Array.isArray(artwork.tags) && artwork.tags.length > 0 && (
                <>
                  {artwork.tags
                    .filter(tag => !['sold', 'consigned', 'available', 'reserved'].includes(tag))
                    .slice(0, artwork.status ? 4 : 5)
                    .map((tag) => (
                      <div
                        key={tag}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border backdrop-blur-md bg-black/60 text-white border-white/20"
                      >
                        {tag}
                      </div>
                    ))}
                  {artwork.tags.filter(tag => !['sold', 'consigned', 'available', 'reserved'].includes(tag)).length > (artwork.status ? 4 : 5) && (
                    <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-medium border border-white/20">
                      +{artwork.tags.filter(tag => !['sold', 'consigned', 'available', 'reserved'].includes(tag)).length - (artwork.status ? 4 : 5)}
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 flex flex-col flex-1">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-slate-800 truncate-title mb-1">
                {artwork.title}
              </h3>
              <p className="text-slate-600 text-sm truncate">{artwork.artist}</p>
            </div>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 text-slate-400 hover:text-slate-600 flex-shrink-0"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={(e) => { e.stopPropagation(); onEdit(artwork); }}>
                  <Pencil className="h-4 w-4 mr-2" />
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem 
                  onClick={(e) => { e.stopPropagation(); onDelete(artwork.id); }}
                  className="text-red-600"
                >
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Artwork details */}
          <div className="space-y-2 text-sm text-slate-600 flex-1">
            {artwork.year && (
              <div className="flex items-center gap-1">
                <Calendar className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{artwork.year}</span>
              </div>
            )}
            {artwork.medium && (
              <div className="flex items-center gap-1">
                <Palette className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{artwork.medium}</span>
              </div>
            )}
          </div>

          {/* Price */}
          {artwork.price && (
            <div className="text-2xl font-bold text-slate-800 mt-4">
              ${artwork.price.toLocaleString()}
            </div>
          )}
        </div>
      </Card>
    </motion.div>
  );
}

// Draggable Tag Component
function DraggableTag({ tagInfo, isSelected, onClick }: {
  tagInfo: { tag: string; description: string; color: string };
  isSelected: boolean;
  onClick: () => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    isDragging,
  } = useDraggable({
    id: tagInfo.tag,
  });

  const style = transform ? {
    transform: `translate3d(${transform.x}px, ${transform.y}px, 0)`,
  } : undefined;

  return (
    <button
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className={`
        px-2.5 py-1 rounded-full text-xs font-medium border transition-all hover:scale-105 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-50 scale-105' : ''}
        ${isSelected 
          ? `${tagInfo.color} ring-1 ring-offset-1 ring-slate-300` 
          : `${tagInfo.color} hover:opacity-80`
        }
      `}
      title={tagInfo.description}
    >
      {tagInfo.tag}
    </button>
  );
}

export default function Inventory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { t } = useTranslation();
  const [artworks, setArtworks] = useState<Artwork[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showImportWizard, setShowImportWizard] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string>("");
  const [activeId, setActiveId] = useState<string | null>(null);
  const [draggedTag, setDraggedTag] = useState<string | null>(null);
  const [isDraggingOverNonDropZone, setIsDraggingOverNonDropZone] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    setActiveId(active.id as string);
    
    // Check if it's a tag being dragged
    const tagInfo = suggestedTags.find(tag => tag.tag === active.id);
    if (tagInfo) {
      setDraggedTag(tagInfo.tag);
    }
  };

  const handleDragOver = (event: DragOverEvent) => {
    const { over } = event;
    
    if (!over || !draggedTag) {
      setIsDraggingOverNonDropZone(true);
      return;
    }

    // Check if over an artwork
    if (over.id && typeof over.id === 'string' && over.id.startsWith('artwork-')) {
      setIsDraggingOverNonDropZone(false);
    } else {
      setIsDraggingOverNonDropZone(true);
    }
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);
    setDraggedTag(null);
    setIsDraggingOverNonDropZone(false);

    if (!draggedTag) return;

    // Check if dropped on an artwork
    if (over && over.id && typeof over.id === 'string' && over.id.startsWith('artwork-')) {
      const actualArtworkId = over.id.replace('artwork-', '');
      addTagToArtwork(actualArtworkId, draggedTag);
    } else {
      // Dropped outside artwork - remove tag from all artworks that have it
      removeTagFromAllArtworks(draggedTag);
    }
  };

  const addTagToArtwork = async (artworkId: string, tag: string) => {
    try {
      const artwork = artworks.find(a => a.id === artworkId);
      if (!artwork) return;

      const currentTags = artwork.tags || [];
      if (currentTags.includes(tag)) {
        toast({
          title: "Tag already exists",
          description: `This artwork already has the "${tag}" tag.`,
        });
        return;
      }

      const updatedTags = [...currentTags, tag];

      const { error } = await supabase
        .from("artworks")
        .update({ tags: updatedTags })
        .eq("id", artworkId);

      if (error) throw error;

      // Update local state
      setArtworks(prev => 
        prev.map(a => 
          a.id === artworkId 
            ? { ...a, tags: updatedTags }
            : a
        )
      );

      toast({
        title: "Tag added",
        description: `Added "${tag}" tag to "${artwork.title}".`,
      });
    } catch (error) {
      console.error("Error adding tag:", error);
      toast({
        title: "Error",
        description: "Failed to add tag to artwork.",
        variant: "destructive",
      });
    }
  };

  const removeTagFromAllArtworks = async (tag: string) => {
    try {
      // Find all artworks that have this tag
      const artworksWithTag = artworks.filter(artwork => 
        artwork.tags && artwork.tags.includes(tag)
      );

      if (artworksWithTag.length === 0) {
        toast({
          title: "Tag not found",
          description: `No artworks currently have the "${tag}" tag.`,
        });
        return;
      }

      // Remove tag from each artwork
      const updatePromises = artworksWithTag.map(async (artwork) => {
        const updatedTags = artwork.tags!.filter(t => t !== tag);
        
        const { error } = await supabase
          .from("artworks")
          .update({ tags: updatedTags })
          .eq("id", artwork.id);

        if (error) throw error;
        return { ...artwork, tags: updatedTags };
      });

      const updatedArtworks = await Promise.all(updatePromises);

      // Update local state
      setArtworks(prev => 
        prev.map(artwork => {
          const updated = updatedArtworks.find(u => u.id === artwork.id);
          return updated || artwork;
        })
      );

      toast({
        title: "Tag removed",
        description: `Removed "${tag}" tag from ${artworksWithTag.length} artwork${artworksWithTag.length > 1 ? 's' : ''}.`,
      });
    } catch (error) {
      console.error("Error removing tag:", error);
      toast({
        title: "Error",
        description: "Failed to remove tag from artworks.",
        variant: "destructive",
      });
    }
  };

  const handleEditArtwork = (artwork: Artwork) => {
    navigate(`/inventory/${artwork.id}`);
  };

  const handleDeleteArtwork = async (id: string) => {
    try {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setArtworks(prev => prev.filter(a => a.id !== id));
      
      toast({
        title: "Artwork deleted",
        description: "The artwork has been removed from your collection.",
      });
    } catch (error) {
      console.error("Error deleting artwork:", error);
      toast({
        title: "Error",
        description: "Failed to delete artwork.",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchArtworks();

    // Subscribe to realtime updates
    const channel = supabase
      .channel('artworks-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'artworks'
        },
        () => {
          fetchArtworks();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const fetchArtworks = async () => {
    try {
      const { data, error } = await supabase
        .from("artworks")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setArtworks(data || []);
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this artwork?")) return;

    try {
      const { error } = await supabase
        .from("artworks")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Artwork deleted successfully",
      });

      fetchArtworks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      const artwork = artworks.find(a => a.id === id);
      if (!artwork) return;

      // Get current tags, ensuring it's an array
      const currentTags = Array.isArray(artwork.tags) ? artwork.tags : [];
      
      // Remove existing status tags
      const filteredTags = currentTags.filter(t => !['sold', 'consigned', 'available', 'reserved'].includes(t));
      
      // Add new status tag
      const updatedTags = [...filteredTags, newStatus];

      const updates: any = { 
        status: newStatus,
        tags: updatedTags
      };

      // If marking as sold, add sale date and buyer info
      if (newStatus === "sold") {
        updates.sale_date = new Date().toISOString().split('T')[0];
        updates.buyer_name = "Direct Sale";
      }

      // If marking as consigned
      if (newStatus === "consigned") {
        updates.on_consignment = true;
      }

      const { error } = await supabase
        .from("artworks")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: `Artwork marked as ${newStatus}`,
      });

      fetchArtworks();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  // Suggested tags based on app functionality
  const suggestedTags = [
    // Status tags (determine where artwork appears)
    { tag: "available", description: "Available for sale", color: "bg-green-100 text-green-800 border-green-200" },
    { tag: "sold", description: "Sold - appears in transactions", color: "bg-red-100 text-red-800 border-red-200" },
    { tag: "consigned", description: "On consignment - appears in consignments", color: "bg-blue-100 text-blue-800 border-blue-200" },
    { tag: "reserved", description: "Reserved for client", color: "bg-yellow-100 text-yellow-800 border-yellow-200" },
    
    // Artwork categories
    { tag: "painting", description: "Paintings", color: "bg-purple-100 text-purple-800 border-purple-200" },
    { tag: "sculpture", description: "Sculptures", color: "bg-indigo-100 text-indigo-800 border-indigo-200" },
    { tag: "photography", description: "Photography", color: "bg-pink-100 text-pink-800 border-pink-200" },
    { tag: "drawing", description: "Drawings", color: "bg-orange-100 text-orange-800 border-orange-200" },
    
    // Art styles
    { tag: "abstract", description: "Abstract art", color: "bg-teal-100 text-teal-800 border-teal-200" },
    { tag: "modern", description: "Modern art", color: "bg-cyan-100 text-cyan-800 border-cyan-200" },
    { tag: "contemporary", description: "Contemporary art", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
    { tag: "classical", description: "Classical art", color: "bg-amber-100 text-amber-800 border-amber-200" },
    
    // Medium tags
    { tag: "oil", description: "Oil painting", color: "bg-slate-100 text-slate-800 border-slate-200" },
    { tag: "acrylic", description: "Acrylic painting", color: "bg-gray-100 text-gray-800 border-gray-200" },
    { tag: "watercolor", description: "Watercolor", color: "bg-sky-100 text-sky-800 border-sky-200" },
    { tag: "bronze", description: "Bronze sculpture", color: "bg-stone-100 text-stone-800 border-stone-200" },
    
    // Size categories
    { tag: "large", description: "Large artwork", color: "bg-rose-100 text-rose-800 border-rose-200" },
    { tag: "medium", description: "Medium artwork", color: "bg-violet-100 text-violet-800 border-violet-200" },
    { tag: "small", description: "Small artwork", color: "bg-lime-100 text-lime-800 border-lime-200" },
    
    // Special categories
    { tag: "featured", description: "Featured artwork", color: "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200" },
    { tag: "exhibition", description: "Exhibition piece", color: "bg-zinc-100 text-zinc-800 border-zinc-200" },
    { tag: "gift", description: "Gift/Donation", color: "bg-neutral-100 text-neutral-800 border-neutral-200" }
  ];

  const filteredArtworks = artworks.filter((artwork) => {
    const query = searchQuery.toLowerCase();
    const tags = Array.isArray(artwork.tags) ? artwork.tags : [];
    const matchesSearch = (
      artwork.title.toLowerCase().includes(query) ||
      artwork.artist.toLowerCase().includes(query) ||
      tags.some(tag => tag.toLowerCase().includes(query))
    );
    
    const matchesTag = selectedTag === "" || 
      tags.some(tag => tag.toLowerCase() === selectedTag.toLowerCase());
    
    return matchesSearch && matchesTag;
  });

  const getStatusColor = (status: string) => {
    switch (status) {
      case "available":
        return "default";
      case "sold":
        return "destructive";
      case "consigned":
        return "secondary";
      case "reserved":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <AuroraBackground>
      {/* Language Toggle */}
      <div className="absolute top-4 right-4 z-30">
        <LanguageToggle />
      </div>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
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
              onClick={() => navigate("/dashboard")}
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 w-full sm:w-auto tap-target"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              {t("common.back")}
            </Button>
            <div className="hidden sm:block w-px h-8 bg-slate-200" />
            <div className="w-full sm:w-auto">
              <h1 className="text-responsive-h1 font-bold text-slate-800 mb-2 break-words">{t("inventory.title")}</h1>
              <p className="text-mobile-sm text-slate-600 break-words">
                {filteredArtworks.length} artwork{filteredArtworks.length !== 1 ? "s" : ""} in your collection
              </p>
            </div>
          </div>
          <div className="flex gap-2 w-full sm:w-auto">
            <HowItWorksModal />
            <Button 
              onClick={() => setShowImportWizard(true)}
              variant="outline"
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 flex-1 sm:flex-initial"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <ExportButton artworks={filteredArtworks} />
          <Button 
            onClick={() => navigate("/inventory/add")}
            variant="outline"
              className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20 flex-1 sm:flex-initial"
          >
            <Plus className="h-4 w-4 mr-2" />
              Add
          </Button>
          </div>
        </div>

        {/* Search */}
        <div className="mb-6 sm:mb-8">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-slate-400" />
            <Input
              placeholder={t("inventory.searchPlaceholder")}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 bg-white border-slate-200 w-full tap-target min-w-0"
            />
          </div>
        </div>

        {/* Artwork Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center gap-3 text-slate-600">
              <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
              Loading your collection...
            </div>
          </div>
        ) : filteredArtworks.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Palette className="h-12 w-12 text-slate-400" />
            </div>
            <h3 className="text-responsive-h2 font-semibold text-slate-800 mb-3 break-words">
              {searchQuery ? "No artworks found" : "Start building your collection"}
            </h3>
            <p className="text-mobile-base text-slate-600 mb-8 max-w-md mx-auto break-words">
              {searchQuery 
                ? "Try adjusting your search terms or browse all artworks."
                : "Add your first artwork to begin cataloging your collection."
              }
            </p>
            {!searchQuery && (
              <Button 
                onClick={() => navigate("/inventory/add")}
                variant="outline"
                className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Artwork
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 min-w-0">
            {filteredArtworks.map((artwork, index) => (
              <DroppableArtworkCard
                key={artwork.id}
                artwork={artwork}
                index={index}
                onEdit={handleEditArtwork}
                onDelete={handleDeleteArtwork}
              />
            ))}
                      </div>
                    )}
                    
        {/* Suggested Tags - Bottom Section */}
        {!loading && filteredArtworks.length > 0 && (
          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="text-center mb-6">
              <h3 className="text-mobile-sm font-medium text-slate-600 mb-2 break-words">Suggested Tags</h3>
              <p className="text-mobile-xs text-slate-500 break-words">
                Tags determine where your artwork appears in the app. Click to filter by tag, drag onto artworks to add, or drag outside to remove from all artworks.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-2 max-w-4xl mx-auto">
              {suggestedTags.map((tagInfo) => (
                <DraggableTag
                  key={tagInfo.tag}
                  tagInfo={tagInfo}
                  isSelected={selectedTag === tagInfo.tag}
                  onClick={() => setSelectedTag(selectedTag === tagInfo.tag ? "" : tagInfo.tag)}
                />
              ))}
            </div>

            {/* Clear Filter */}
            {selectedTag && (
              <div className="text-center mt-4">
                              <button
                  onClick={() => setSelectedTag("")}
                  className="text-xs text-slate-500 hover:text-slate-700 underline"
                >
                  Clear filter: {selectedTag}
                              </button>
                          </div>
                        )}
                      </div>
                    )}

        {/* Drag Overlay */}
        <DragOverlay>
          {activeId ? (
            <div className={`px-2.5 py-1 rounded-full text-xs font-medium border shadow-lg flex items-center gap-1 ${
              isDraggingOverNonDropZone 
                ? 'bg-red-100 border-red-300 text-red-800' 
                : 'bg-white border-slate-300 text-slate-800'
            }`}>
              <span>{draggedTag}</span>
              <span className="text-slate-400">•</span>
              <span className="text-xs">
                {isDraggingOverNonDropZone 
                  ? 'Drop here to remove from all artworks' 
                  : 'Drop on artwork to add'
                }
              </span>
                      </div>
          ) : null}
        </DragOverlay>
      </motion.div>

      <ImportWizard
        open={showImportWizard}
        onClose={() => setShowImportWizard(false)}
        onImportComplete={fetchArtworks}
      />
      </DndContext>
    </AuroraBackground>
  );
}
