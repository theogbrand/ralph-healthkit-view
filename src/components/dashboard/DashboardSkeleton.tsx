'use client';

export function DashboardSkeleton() {
  return (
    <div className="space-y-10 animate-in fade-in-0 duration-300">
      {/* Fitness Score Skeleton */}
      <div className="flex justify-center py-8">
        <div
          className="w-[200px] h-[200px] rounded-full bg-muted relative overflow-hidden"
        >
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
            style={{
              backgroundSize: '200% 100%',
              animation: 'shimmer 1.5s infinite',
            }}
          />
        </div>
      </div>

      {/* Category Cards Skeleton */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {[1, 2].map((i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-muted relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
              style={{
                backgroundSize: '200% 100%',
                animation: 'shimmer 1.5s infinite',
              }}
            />
          </div>
        ))}
      </div>

      {/* Chart Skeleton */}
      <div className="h-[200px] rounded-2xl bg-muted relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>

      {/* Trend Chart Skeleton */}
      <div className="h-[300px] rounded-2xl bg-muted relative overflow-hidden">
        <div
          className="absolute inset-0 bg-gradient-to-r from-transparent via-foreground/5 to-transparent"
          style={{
            backgroundSize: '200% 100%',
            animation: 'shimmer 1.5s infinite',
          }}
        />
      </div>
    </div>
  );
}
