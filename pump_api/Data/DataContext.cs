global using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using pump_api.Models;

namespace pump_api.Data
{
    public class DataContext : DbContext
    {
        public DataContext(DbContextOptions<DataContext> options) : base(options)
        {

        }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            // Configure Pump entity
            modelBuilder.Entity<Pump>()
                .HasOne(p => p.User)
                .WithMany(u => u.Pumps)
                .HasForeignKey(p => p.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Configure PumpInspection entity
            modelBuilder.Entity<PumpInspection>()
                .HasOne(pi => pi.Pump)
                .WithMany(p => p.Inspections)
                .HasForeignKey(pi => pi.PumpId)
                .OnDelete(DeleteBehavior.Cascade);

            modelBuilder.Entity<PumpInspection>()
                .HasOne(pi => pi.Inspector)
                .WithMany(u => u.Inspections)
                .HasForeignKey(pi => pi.InspectorId)
                .OnDelete(DeleteBehavior.Restrict);

            // Configure RefreshToken entity
            modelBuilder.Entity<RefreshToken>()
                .HasOne(rt => rt.User)
                .WithMany(u => u.RefreshTokens)
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
        }

        public DbSet<User> Users => Set<User>();
        public DbSet<Pump> Pumps => Set<Pump>();
        public DbSet<PumpInspection> PumpInspections => Set<PumpInspection>();
        public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();
    }
}