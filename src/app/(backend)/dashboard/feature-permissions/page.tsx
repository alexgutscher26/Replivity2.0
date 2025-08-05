"use client";

import React, { useState } from "react";
import { useFeaturePermissionsAdmin } from "@/hooks/use-feature-access";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader2, Settings, Shield, Crown, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ProductFeatureDialogProps {
  productId: string;
  productName: string;
  onClose: () => void;
}

function ProductFeatureDialog({ productId, productName, onClose }: ProductFeatureDialogProps) {
  const { getProductFeatures, updateProductFeatures, availableFeatures } = useFeaturePermissionsAdmin();
  const productFeaturesQuery = getProductFeatures(productId);
  const [features, setFeatures] = useState<Record<string, boolean>>({});
  const [hasChanges, setHasChanges] = useState(false);

  // Initialize features state when data loads
  React.useEffect(() => {
    if (productFeaturesQuery.data) {
      const initialFeatures: Record<string, boolean> = {};
      productFeaturesQuery.data.forEach((feature) => {
        initialFeatures[feature.key] = feature.enabled;
      });
      setFeatures(initialFeatures);
    }
  }, [productFeaturesQuery.data]);

  const handleFeatureToggle = (featureKey: string, enabled: boolean) => {
    setFeatures(prev => ({ ...prev, [featureKey]: enabled }));
    setHasChanges(true);
  };

  const handleSave = async () => {
    try {
      const featureArray = Object.entries(features).map(([featureKey, enabled]) => ({
        featureKey,
        enabled,
      }));

      await updateProductFeatures.mutateAsync({
        productId,
        features: featureArray,
      });

      toast.success(`Features updated for ${productName}`);
      setHasChanges(false);
      onClose();
    } catch (error) {
      toast.error("Failed to update features");
      console.error(error);
    }
  };

  if (productFeaturesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-6 w-6 animate-spin" />
        <span className="ml-2">Loading features...</span>
      </div>
    );
  }

  return (
    <DialogContent className="max-w-2xl max-h-[80vh]">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2">
          <Settings className="h-5 w-5" />
          Configure Features for {productName}
        </DialogTitle>
        <DialogDescription>
          Select which features should be available for users with this plan.
        </DialogDescription>
      </DialogHeader>

      <ScrollArea className="max-h-[60vh] pr-4">
        <div className="space-y-4">
          {availableFeatures.map((feature) => {
            const isEnabled = features[feature.key] ?? false;
            return (
              <div key={feature.key} className="flex items-start space-x-3 p-3 border rounded-lg">
                <Switch
                  id={feature.key}
                  checked={isEnabled}
                  onCheckedChange={(checked) => handleFeatureToggle(feature.key, checked)}
                />
                <div className="flex-1 space-y-1">
                  <Label htmlFor={feature.key} className="text-sm font-medium cursor-pointer">
                    {feature.displayName}
                  </Label>
                  <p className="text-xs text-muted-foreground">
                    {feature.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      <Separator />

      <div className="flex justify-between items-center">
        <div className="text-sm text-muted-foreground">
          {Object.values(features).filter(Boolean).length} of {availableFeatures.length} features enabled
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={!hasChanges || updateProductFeatures.isPending}
          >
            {updateProductFeatures.isPending && <Loader2 className="h-4 w-4 animate-spin mr-2" />}
            Save Changes
          </Button>
        </div>
      </div>
    </DialogContent>
  );
}

function getPlanIcon(planName: string) {
  const plan = planName.toLowerCase();
  
  if (plan.includes('pro') || plan.includes('premium')) {
    return <Crown className="h-4 w-4" />;
  }
  
  if (plan.includes('enterprise') || plan.includes('business')) {
    return <Sparkles className="h-4 w-4" />;
  }
  
  return null;
}

export default function FeaturePermissionsPage() {
  const { productsWithFeatures, isLoading, error } = useFeaturePermissionsAdmin();
  const [selectedProduct, setSelectedProduct] = useState<{ id: string; name: string } | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading feature permissions...</span>
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <AlertDescription>
          Error loading feature permissions: {error.message}
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2">
        <Shield className="h-6 w-6" />
        <div>
          <h1 className="text-2xl font-bold">Feature Permissions</h1>
          <p className="text-muted-foreground">
            Configure which features are available for each pricing plan
          </p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {productsWithFeatures.map((product) => {
          const featurePercentage = Math.round(
            (product.enabledFeatureCount / product.totalFeatureCount) * 100
          );

          return (
            <Card key={product.id} className="relative">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    {getPlanIcon(product.name)}
                    {product.name}
                  </CardTitle>
                  {product.isFree && (
                    <Badge variant="secondary" className="text-xs">
                      Free
                    </Badge>
                  )}
                </div>
                <CardDescription className="text-sm">
                  {product.description ?? "No description available"}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Features enabled:</span>
                  <span className="font-medium">
                    {product.enabledFeatureCount} / {product.totalFeatureCount}
                  </span>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-primary h-2 rounded-full transition-all duration-300" 
                    style={{ width: `${featurePercentage}%` }}
                  />
                </div>
                
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">
                    {featurePercentage}% coverage
                  </span>
                  {!product.isFree && (
                    <span className="text-sm font-medium">
                      ${product.price}/month
                    </span>
                  )}
                </div>
                
                <Dialog>
                  <DialogTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => setSelectedProduct({ id: product.id, name: product.name })}
                    >
                      <Settings className="h-4 w-4 mr-2" />
                      Configure Features
                    </Button>
                  </DialogTrigger>
                  {selectedProduct?.id === product.id && (
                    <ProductFeatureDialog
                      productId={product.id}
                      productName={product.name}
                      onClose={() => setSelectedProduct(null)}
                    />
                  )}
                </Dialog>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {productsWithFeatures.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No Products Found</h3>
            <p className="text-muted-foreground text-center max-w-md">
              Create some products first to configure their feature permissions.
            </p>
            <Button className="mt-4" asChild>
              <a href="/dashboard/products">Manage Products</a>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}