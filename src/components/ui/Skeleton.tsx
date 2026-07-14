import React from 'react';
import styles from './Skeleton.module.css';

interface SkeletonProps {
  className?: string;
  width?: string | number;
  height?: string | number;
  radius?: string | number;
  style?: React.CSSProperties;
}

export function Skeleton({ className = '', width, height, radius, style, ...props }: SkeletonProps) {
  return (
    <div 
      className={`${styles.skeleton} ${className}`} 
      style={{ 
        width: width || '100%', 
        height: height || '100%', 
        borderRadius: radius,
        ...style 
      }} 
      {...props} 
    />
  );
}

export function ProductCardSkeleton() {
  return (
    <div className={styles.productCardSkeleton}>
      <Skeleton className={styles.imageSkeleton} />
      <div className={styles.infoSkeleton}>
        <div className={styles.rowSkeleton}>
          <Skeleton width="60%" height="20px" />
          <Skeleton width="25%" height="20px" />
        </div>
        <Skeleton width="40%" height="14px" />
        <div className={styles.colorsSkeleton}>
          <Skeleton className={styles.colorSkeleton} />
          <Skeleton className={styles.colorSkeleton} />
          <Skeleton className={styles.colorSkeleton} />
        </div>
      </div>
    </div>
  );
}
