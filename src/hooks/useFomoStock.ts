import { useState, useEffect } from 'react';

export function useFomoStock(productId: string | undefined, realStock: number) {
  const [fomoStock, setFomoStock] = useState<number | null>(null);
  const [totalBought, setTotalBought] = useState<number | null>(null);
  const [isRestocking, setIsRestocking] = useState(false);
  const [restockTimeRemaining, setRestockTimeRemaining] = useState(0);

  useEffect(() => {
    if (!productId) return;
    if (realStock <= 0) {
      // If the real admin stock is completely 0, we honor that and don't do fake stock.
      setFomoStock(0);
      setTotalBought(0);
      setIsRestocking(false);
      return;
    }

    // Initialize FOMO stock for the session
    const getInitialStock = () => Math.floor(Math.random() * (1050 - 850 + 1)) + 850;
    
    const boughtKey = `dualdeer_fomo_bought_${productId}`;
    const timeKey = `dualdeer_fomo_bought_time_${productId}`;
    let initialBought = 150;
    
    // Only access localStorage if window is defined
    if (typeof window !== 'undefined') {
      const storedBought = localStorage.getItem(boughtKey);
      const storedTime = localStorage.getItem(timeKey);
      
      if (storedBought && storedTime && !isNaN(parseInt(storedBought, 10))) {
        initialBought = parseInt(storedBought, 10);
        const lastTime = parseInt(storedTime, 10);
        const hoursPassed = Math.floor((Date.now() - lastTime) / (1000 * 60 * 60));
        
        if (hoursPassed > 0) {
          // Add 1-3 for each hour passed
          for (let i = 0; i < hoursPassed; i++) {
            initialBought += Math.floor(Math.random() * 3) + 1;
          }
          localStorage.setItem(boughtKey, initialBought.toString());
          localStorage.setItem(timeKey, Date.now().toString());
        }
      } else {
        localStorage.setItem(boughtKey, '150');
        localStorage.setItem(timeKey, Date.now().toString());
      }
    }
    
    setFomoStock(getInitialStock());
    setTotalBought(initialBought);
    setIsRestocking(false);
    setRestockTimeRemaining(0);

    // Hourly increment interval for the active session
    let hourlyInterval: NodeJS.Timeout;
    if (typeof window !== 'undefined') {
      hourlyInterval = setInterval(() => {
        setTotalBought(currentBought => {
          const newBought = (currentBought || 150) + Math.floor(Math.random() * 3) + 1;
          localStorage.setItem(boughtKey, newBought.toString());
          localStorage.setItem(timeKey, Date.now().toString());
          return newBought;
        });
      }, 1000 * 60 * 60); // Every 1 hour
    }

    return () => {
      if (hourlyInterval) clearInterval(hourlyInterval);
    };
  }, [productId, realStock]);

  useEffect(() => {
    if (fomoStock === null || fomoStock <= 0 || isRestocking || realStock <= 0) return;

    let timeoutId: NodeJS.Timeout;

    const decreaseStock = () => {
      setFomoStock(prev => {
        if (!prev) return 0;
        // Drop slowly
        const maxDrop = prev < 50 ? 5 : prev < 200 ? 3 : 2;
        const dropAmount = Math.floor(Math.random() * maxDrop) + 1;
        
        const nextStock = prev - dropAmount;

        if (nextStock <= 0) {
          setIsRestocking(true);
          // 2 to 5 minutes in seconds (120 to 300)
          const restockSeconds = Math.floor(Math.random() * (300 - 120 + 1)) + 120;
          setRestockTimeRemaining(restockSeconds);
          return 0;
        }
        return nextStock;
      });

      // Tick between 3s and 8s for a slower drop
      const nextTick = Math.floor(Math.random() * (8000 - 3000 + 1)) + 3000;
      timeoutId = setTimeout(decreaseStock, nextTick);
    };

    timeoutId = setTimeout(decreaseStock, 3000);

    return () => clearTimeout(timeoutId);
  }, [fomoStock, isRestocking, realStock]);

  // Handle the restocking countdown
  useEffect(() => {
    if (!isRestocking || restockTimeRemaining <= 0) return;

    const timerId = setInterval(() => {
      setRestockTimeRemaining(prev => {
        if (prev <= 1) {
          clearInterval(timerId);
          setIsRestocking(false);
          // Re-up the stock
          setFomoStock(Math.floor(Math.random() * (1050 - 850 + 1)) + 850);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerId);
  }, [isRestocking, restockTimeRemaining]);

  const formattedTime = () => {
    const mins = Math.floor(restockTimeRemaining / 60).toString().padStart(2, '0');
    const secs = (restockTimeRemaining % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };

  return {
    fomoStock: fomoStock !== null ? fomoStock : realStock,
    totalBought: totalBought !== null ? totalBought : 0,
    isRestocking,
    restockTimeRemaining,
    formattedTime: formattedTime(),
    isReady: fomoStock !== null
  };
}
