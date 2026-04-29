import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HelpCircle, Tag, ArrowRight, CheckCircle } from "lucide-react";
import { motion } from "framer-motion";

interface HowItWorksModalProps {
  children?: React.ReactNode;
}

export function HowItWorksModal({ children }: HowItWorksModalProps) {
  const features = [
    {
      icon: Tag,
      title: "Smart Tag System",
      description: "Organize artworks with custom tags that automatically categorize your collection",
      color: "bg-blue-500",
    },
    {
      icon: ArrowRight,
      title: "Automatic Organization",
      description: "Adding 'sold' moves artwork to sold section, 'consignment' moves to consignments",
      color: "bg-green-500",
    },
    {
      icon: CheckCircle,
      title: "Easy Filtering",
      description: "Tags are the primary way to categorize and filter your artwork collection",
      color: "bg-purple-500",
    },
  ];

  const tagExamples = [
    { tag: "sold", description: "Moves to sold section", color: "bg-red-500" },
    { tag: "consignment", description: "Moves to consignments", color: "bg-blue-500" },
    { tag: "available", description: "Available for sale", color: "bg-green-500" },
    { tag: "reserved", description: "Reserved for client", color: "bg-yellow-500" },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>
        {children || (
          <Button
            variant="outline"
            size="sm"
            className="rounded-full border-white/20 bg-white/10 backdrop-blur-md hover:bg-white/20"
          >
            <HelpCircle className="h-4 w-4 mr-2" />
            How it Works
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-md border border-white/40">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <Tag className="h-6 w-6 text-blue-600" />
            How Tags Work
          </DialogTitle>
          <DialogDescription className="text-slate-600 text-base">
            Learn how to organize and categorize your artwork collection using our smart tag system.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Main explanation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-blue-50/50 rounded-xl border border-blue-200/50"
          >
            <p className="text-slate-700 leading-relaxed">
              <strong>Gaia Capital uses tags to organize your artworks automatically.</strong> You can add multiple tags 
              separated by commas, and the system automatically moves artworks to the appropriate sections based on status tags.
            </p>
          </motion.div>

          {/* Features */}
          <div className="space-y-4">
            {features.map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-start gap-4 p-4 bg-slate-50/50 rounded-xl"
              >
                <div className={`p-2 rounded-lg ${feature.color} text-white`}>
                  <feature.icon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-slate-800 mb-1">{feature.title}</h3>
                  <p className="text-sm text-slate-600">{feature.description}</p>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Tag examples */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="space-y-3"
          >
            <h3 className="font-semibold text-slate-800 flex items-center gap-2">
              <Tag className="h-4 w-4" />
              Common Tags
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {tagExamples.map((example, index) => (
                <motion.div
                  key={example.tag}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.6 + index * 0.1 }}
                  className="flex items-center gap-3 p-3 bg-white rounded-lg border border-slate-200"
                >
                  <Badge className={`${example.color} text-white border-0`}>
                    {example.tag}
                  </Badge>
                  <span className="text-sm text-slate-600">{example.description}</span>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Usage tip */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.8 }}
            className="p-4 bg-amber-50/50 rounded-xl border border-amber-200/50"
          >
            <div className="flex items-start gap-3">
              <div className="p-1.5 rounded-lg bg-amber-500 text-white">
                <HelpCircle className="h-4 w-4" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-800 mb-1">Pro Tip</h4>
                <p className="text-sm text-slate-600">
                  You can add multiple tags separated by commas (e.g., "abstract, modern, sold"). 
                  The system will prioritize status tags (sold, consignment, available) for automatic organization 
                  while preserving your custom descriptive tags.
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
