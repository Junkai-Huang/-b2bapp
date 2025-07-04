'use client';

import Link from 'next/link';
import { Product } from '@/utils/supabaseClient';

interface ProductCardProps {
  product: Product & {
    seller?: {
      business_name: string;
    };
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  return (
    <Link href={`/product/${product.id}`} className="block">
      <div className="card hover:shadow-lg transition-shadow cursor-pointer">
        <div className="aspect-w-1 aspect-h-1 w-full overflow-hidden rounded-t-lg bg-gray-200">
          {product.image_url ? (
            <img
              src={product.image_url}
              alt={product.name_cn}
              className="w-full h-48 object-cover"
            />
          ) : (
            <div className="w-full h-48 bg-gradient-to-br from-green-100 to-green-200 flex items-center justify-center">
              <span className="text-green-600 font-medium text-lg">
                {product.name_cn.charAt(0)}
              </span>
            </div>
          )}
        </div>
        
        <div className="p-4">
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            {product.name_cn}
          </h3>
          
          {product.description && (
            <p className="text-sm text-gray-500 mb-2 line-clamp-2">
              {product.description}
            </p>
          )}
          
          <div className="flex items-center justify-between mb-2">
            <span className="text-lg font-bold text-red-600">
              ¥{product.price.toFixed(2)}/kg
            </span>
            <span className="text-sm text-gray-500">
              库存: {product.stock}kg
            </span>
          </div>
          
          {product.seller && (
            <div className="text-xs text-gray-400 border-t pt-2">
              供应商: {product.seller.business_name}
            </div>
          )}
          
          {product.stock === 0 && (
            <div className="absolute top-2 right-2 bg-red-500 text-white text-xs px-2 py-1 rounded">
              缺货
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
