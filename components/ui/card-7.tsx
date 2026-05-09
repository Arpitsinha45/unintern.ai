import * as React from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ArrowRight, Star } from "lucide-react";

// Define the props for the TravelCard component
interface TravelCardProps extends React.HTMLAttributes<HTMLDivElement> {
  imageUrl: string;
  imageAlt: string;
  title: string;
  location: string;
  overview: string;
  price: string | number;
  pricePeriod: string;
  onBookNow: () => void;
  rating?: number;
  reviewCount?: number;
  badge?: string;
  isActive?: boolean;
  skills?: string[];
  isAvailable?: boolean;
}

const TravelCard = React.memo(React.forwardRef<HTMLDivElement, TravelCardProps>(
  (
    {
      className,
      imageUrl,
      imageAlt,
      title,
      location,
      overview,
      price,
      pricePeriod,
      onBookNow,
      rating,
      reviewCount,
      badge,
      isActive,
      skills,
      isAvailable,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        className={cn(
          "group relative w-full h-[260px] sm:h-[450px] overflow-hidden rounded-[20px] sm:rounded-[32px] border border-white/10 bg-[#0f0f14] will-change-transform",
          "transition-all duration-500 ease-out hover:border-white/20 hover:shadow-[0_8px_30px_rgba(0,0,0,0.5)] hover:-translate-y-1 hover:scale-[1.01]",
          isActive && "border-white/20 shadow-[0_8px_30px_rgba(0,0,0,0.5)] -translate-y-1 scale-[1.01]",
          className
        )}
        {...props}
      >
        {/* Background Image with Zoom Effect on Hover */}
        <img
          src={imageUrl}
          alt={imageAlt}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-in-out group-hover:scale-110 opacity-60 group-hover:opacity-80 will-change-transform",
            isActive && "scale-110 opacity-80"
          )}
          referrerPolicy="no-referrer"
          loading="lazy"
        />

        {/* Gradient Overlay for Text Readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-[#0a0a0f]/40 to-transparent"></div>

        {/* Badge and Availability Dot Container */}
        <div className="absolute top-3 sm:top-6 left-3 sm:left-6 right-3 sm:right-6 z-20 flex justify-between items-start">
          {/* Badge */}
          {badge && (
            <div className="px-2 sm:px-3 py-1 rounded-full bg-emerald-500 text-black text-[6px] sm:text-[9px] font-black uppercase tracking-widest shadow-lg">
              {badge}
            </div>
          )}
          
          {/* Availability Status */}
          {isAvailable !== undefined && (
            <div className="flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-2 py-1 rounded-full border border-white/10 shadow-lg">
              <div className={cn(
                "w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full",
                isAvailable ? "bg-emerald-500 animate-pulse shadow-[0_0_8px_rgba(16,185,129,0.6)]" : "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.6)]"
              )}></div>
              <span className={cn(
                "text-[6px] sm:text-[8px] font-black uppercase tracking-widest",
                isAvailable ? "text-emerald-400" : "text-red-400"
              )}>
                {isAvailable ? 'Online' : 'Offline'}
              </span>
            </div>
          )}
        </div>

        {/* Content Container */}
        <div className="relative flex h-full flex-col justify-end p-3 sm:p-8 text-white">
          {/* Middle Section: Details (slides up on hover) */}
          <div className={cn(
            "space-y-1.5 sm:space-y-3 transition-transform duration-500 ease-in-out group-hover:-translate-y-10 sm:group-hover:-translate-y-20",
            isActive && "-translate-y-10 sm:-translate-y-20"
          )}>
            <div className="flex flex-col mb-0.5 sm:mb-2">
              <div className="flex items-center justify-between">
                <h3 className="text-lg sm:text-3xl font-black text-white uppercase tracking-tight leading-none">{title}</h3>
                {rating !== undefined && (
                  <div className="flex items-center gap-1 bg-black/40 backdrop-blur-md px-1.5 sm:px-2 py-0.5 rounded-lg border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                    <Star className="w-2 h-2 sm:w-3 sm:h-3 text-emerald-400 fill-emerald-400" />
                    <span className="text-[7px] sm:text-[10px] font-black text-white font-mono">{rating.toFixed(1)}</span>
                    {reviewCount !== undefined && (
                      <span className="text-[6px] sm:text-[8px] font-bold text-gray-400 ml-0.5">({reviewCount})</span>
                    )}
                  </div>
                )}
              </div>
              <p className="text-[7px] sm:text-[10px] font-bold text-emerald-400 uppercase tracking-[1.5px] sm:tracking-[3px] mt-0.5 sm:mt-1">{location}</p>
            </div>
            
            {/* Skills - Now displayed prominently and always visible */}
            {skills && skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-1 sm:mt-2">
                {skills.map(skill => (
                  <span key={skill} className="px-2 py-0.5 sm:py-1 rounded-md bg-white/5 border border-white/10 text-[6px] sm:text-[9px] font-bold uppercase tracking-widest text-[#FDB931] group-hover:bg-[#FDB931]/10 group-hover:border-[#FDB931]/30 transition-colors duration-300">
                    {skill}
                  </span>
                ))}
              </div>
            )}
            
            <div className={cn(
              "opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100",
              isActive && "opacity-100"
            )}>
              <h4 className="text-[6px] sm:text-[9px] font-black text-gray-400 uppercase tracking-widest mb-0.5 sm:mb-1 mt-2">Expertise</h4>
              <p className="text-[9px] sm:text-xs text-gray-300 leading-relaxed line-clamp-2 sm:line-clamp-3">
                {overview}
              </p>
            </div>
          </div>

          {/* Bottom Section: Price and Button (revealed on hover) */}
          <div className={cn(
            "absolute -bottom-24 left-0 w-full p-3 sm:p-8 opacity-0 transition-all duration-500 ease-in-out group-hover:bottom-0 group-hover:opacity-100",
            isActive && "bottom-0 opacity-100"
          )}>
            <div className="flex items-end justify-between gap-1.5">
              <div>
                <span className="text-[6px] sm:text-[10px] font-black text-gray-500 uppercase tracking-widest block mb-0.5 sm:mb-1">Rate</span>
                <div className="flex items-baseline gap-0.5 sm:gap-1">
                  <span className="text-lg sm:text-3xl font-black text-white font-mono">{price}</span>
                  <span className="text-[6px] sm:text-[10px] font-bold text-gray-400 uppercase tracking-widest"> {pricePeriod}</span>
                </div>
              </div>
              <Button 
                onClick={(e) => {
                    e.stopPropagation();
                    onBookNow();
                }} 
                size="sm"
                className="bg-white text-black hover:bg-emerald-400 hover:text-black rounded-lg sm:rounded-xl font-black uppercase tracking-widest text-[7px] sm:text-[10px] h-7 sm:h-12 px-2 sm:px-6 shadow-[0_0_20px_rgba(255,255,255,0.2)]"
              >
                Book <ArrowRight className="ml-1 sm:ml-2 h-2.5 w-2.5 sm:h-4 sm:w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  }
));
TravelCard.displayName = "TravelCard";

export { TravelCard };
