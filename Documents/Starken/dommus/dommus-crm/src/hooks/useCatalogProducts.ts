import { useState, useEffect, useCallback } from "react";
import { supabase } from "@/services/supabase/client";
import { toast } from "sonner";
import { CatalogProduct, ProductCategory } from "@/types/crm";

export function useCatalogProducts() {
  const [products, setProducts] = useState<CatalogProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredProducts, setFilteredProducts] = useState<CatalogProduct[]>([]);

  // Fetch products from database
  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("catalog_products")
        .select("*")
        .order("name", { ascending: true });

      if (error) {
        throw error;
      }

      if (data) {
        const transformedProducts: CatalogProduct[] = data.map((product: any) => ({
          id: product.id,
          name: product.name,
          description: product.description,
          sku: product.sku,
          brand: product.brand,
          category: product.category || "Outro",
          subcategory: product.subcategory,
          costPrice: product.cost_price,
          salePrice: product.sale_price,
          suggestedMarkup: product.suggested_markup,
          imageUrl: product.image_url,
          specifications: product.specifications || {},
          supplier: product.supplier,
          inStock: product.in_stock ?? true,
          stockQuantity: product.stock_quantity,
          isActive: product.is_active ?? true,
          createdAt: new Date(product.created_at),
          updatedAt: new Date(product.updated_at),
        }));

        setProducts(transformedProducts);
        setFilteredProducts(transformedProducts);
      }
    } catch (error) {
      console.error("Error fetching products:", error);
      toast.error("Erro ao carregar produtos");
    } finally {
      setLoading(false);
    }
  }, []);

  // Filter products when search query changes
  useEffect(() => {
    if (searchQuery) {
      const filtered = products.filter(
        (product) =>
          product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.brand?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.sku?.toLowerCase().includes(searchQuery.toLowerCase()) ||
          product.category?.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredProducts(filtered);
    } else {
      setFilteredProducts(products);
    }
  }, [searchQuery, products]);

  // Fetch products on mount
  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  // Create product
  const createProduct = async (productData: Partial<CatalogProduct>) => {
    try {
      const snakeCaseData = {
        name: productData.name,
        description: productData.description,
        sku: productData.sku,
        brand: productData.brand,
        category: productData.category || "Outro",
        subcategory: productData.subcategory,
        cost_price: productData.costPrice,
        sale_price: productData.salePrice,
        suggested_markup: productData.suggestedMarkup,
        image_url: productData.imageUrl,
        specifications: productData.specifications || {},
        supplier: productData.supplier,
        in_stock: productData.inStock ?? true,
        stock_quantity: productData.stockQuantity || 0,
        is_active: productData.isActive ?? true,
      };

      const { data, error } = await supabase
        .from("catalog_products")
        .insert(snakeCaseData)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const newProduct: CatalogProduct = {
          id: data.id,
          name: data.name,
          description: data.description,
          sku: data.sku,
          brand: data.brand,
          category: data.category,
          subcategory: data.subcategory,
          costPrice: data.cost_price,
          salePrice: data.sale_price,
          suggestedMarkup: data.suggested_markup,
          imageUrl: data.image_url,
          specifications: data.specifications,
          supplier: data.supplier,
          inStock: data.in_stock,
          stockQuantity: data.stock_quantity,
          isActive: data.is_active,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setProducts((prev) => [newProduct, ...prev]);
        return newProduct;
      }

      return null;
    } catch (error) {
      console.error("Error creating product:", error);
      toast.error("Erro ao criar produto");
      throw error;
    }
  };

  // Update product
  const updateProduct = async (productId: string, updates: Partial<CatalogProduct>) => {
    try {
      const snakeCaseUpdates: any = {};

      if (updates.name !== undefined) snakeCaseUpdates.name = updates.name;
      if (updates.description !== undefined) snakeCaseUpdates.description = updates.description;
      if (updates.sku !== undefined) snakeCaseUpdates.sku = updates.sku;
      if (updates.brand !== undefined) snakeCaseUpdates.brand = updates.brand;
      if (updates.category !== undefined) snakeCaseUpdates.category = updates.category;
      if (updates.subcategory !== undefined) snakeCaseUpdates.subcategory = updates.subcategory;
      if (updates.costPrice !== undefined) snakeCaseUpdates.cost_price = updates.costPrice;
      if (updates.salePrice !== undefined) snakeCaseUpdates.sale_price = updates.salePrice;
      if (updates.suggestedMarkup !== undefined) snakeCaseUpdates.suggested_markup = updates.suggestedMarkup;
      if (updates.imageUrl !== undefined) snakeCaseUpdates.image_url = updates.imageUrl;
      if (updates.specifications !== undefined) snakeCaseUpdates.specifications = updates.specifications;
      if (updates.supplier !== undefined) snakeCaseUpdates.supplier = updates.supplier;
      if (updates.inStock !== undefined) snakeCaseUpdates.in_stock = updates.inStock;
      if (updates.stockQuantity !== undefined) snakeCaseUpdates.stock_quantity = updates.stockQuantity;
      if (updates.isActive !== undefined) snakeCaseUpdates.is_active = updates.isActive;

      const { data, error } = await supabase
        .from("catalog_products")
        .update(snakeCaseUpdates)
        .eq("id", productId)
        .select()
        .single();

      if (error) {
        throw error;
      }

      if (data) {
        const updatedProduct: CatalogProduct = {
          id: data.id,
          name: data.name,
          description: data.description,
          sku: data.sku,
          brand: data.brand,
          category: data.category,
          subcategory: data.subcategory,
          costPrice: data.cost_price,
          salePrice: data.sale_price,
          suggestedMarkup: data.suggested_markup,
          imageUrl: data.image_url,
          specifications: data.specifications,
          supplier: data.supplier,
          inStock: data.in_stock,
          stockQuantity: data.stock_quantity,
          isActive: data.is_active,
          createdAt: new Date(data.created_at),
          updatedAt: new Date(data.updated_at),
        };

        setProducts((prev) =>
          prev.map((p) => (p.id === productId ? updatedProduct : p))
        );

        return updatedProduct;
      }

      return null;
    } catch (error) {
      console.error("Error updating product:", error);
      toast.error("Erro ao atualizar produto");
      throw error;
    }
  };

  // Delete product
  const deleteProduct = async (productId: string) => {
    try {
      const { error } = await supabase
        .from("catalog_products")
        .delete()
        .eq("id", productId);

      if (error) {
        throw error;
      }

      setProducts((prev) => prev.filter((p) => p.id !== productId));
      return true;
    } catch (error) {
      console.error("Error deleting product:", error);
      toast.error("Erro ao excluir produto");
      throw error;
    }
  };

  // Toggle product active status
  const toggleProductActive = async (productId: string) => {
    const product = products.find((p) => p.id === productId);
    if (product) {
      return updateProduct(productId, { isActive: !product.isActive });
    }
  };

  return {
    products,
    setProducts,
    loading,
    searchQuery,
    setSearchQuery,
    filteredProducts,
    createProduct,
    updateProduct,
    deleteProduct,
    toggleProductActive,
    fetchProducts,
  };
}
