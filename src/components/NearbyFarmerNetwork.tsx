"use client";

import { useApp } from "@/lib/AppContext";
import { getNearbyFarmerNetwork } from "@/lib/cropData";

export default function NearbyFarmerNetwork() {
  const { location } = useApp();
  const network = getNearbyFarmerNetwork(location.district, location.state);

  return (
    <div className="card" style={{ padding: 24, borderRadius: 20 }}>
      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap", marginBottom: 18 }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span style={{ fontSize: 24 }}>🌐</span>
            <h3 style={{ fontFamily: "Playfair Display, serif", fontSize: 20, fontWeight: 700, color: "var(--text)" }}>
              Nearby Farmer Network Insights
            </h3>
          </div>
          <p style={{ fontSize: 13, color: "var(--text-muted)", marginTop: 2 }}>
            See what crops peer farmers in {network.district} District ({network.state}) are growing this season
          </p>
        </div>

        <div className="badge badge-green" style={{ padding: "6px 14px", fontSize: 13 }}>
          👥 {network.totalActiveFarmers.toLocaleString("en-IN")} Registered Farmers
        </div>
      </div>

      {/* District Crop Share Bars */}
      <div style={{ display: "flex", flexDirection: "column", gap: 14, marginBottom: 18 }}>
        {network.topCrops.map(crop => (
          <div key={crop.cropId} className="card-sm" style={{ background: "var(--bg)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                <span style={{ fontSize: 20 }}>{crop.cropEmoji}</span>
                <span style={{ fontWeight: 700, fontSize: 14, color: "var(--text)" }}>{crop.cropName}</span>
              </div>

              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ fontSize: 12.5, color: "var(--text-muted)", fontWeight: 600 }}>
                  👨‍🌾 {crop.totalFarmers.toLocaleString("en-IN")} Farmers
                </span>
                <span className={`badge ${crop.trendingStatus.includes("↑") ? "badge-green" : crop.trendingStatus.includes("→") ? "badge-gray" : "badge-red"}`}>
                  {crop.trendingStatus}
                </span>
              </div>
            </div>

            {/* Share progress bar */}
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div className="progress-bar" style={{ flex: 1, height: 8 }}>
                <div
                  className="progress-fill"
                  style={{
                    width: `${crop.sharePercent}%`,
                    background: "linear-gradient(90deg, var(--primary), var(--primary-light))"
                  }}
                />
              </div>
              <span style={{ fontSize: 12.5, fontWeight: 800, color: "var(--primary-dark)", width: 45, textAlign: "right" }}>
                {crop.sharePercent}%
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Advisory Tip */}
      <div style={{
        background: "var(--accent)",
        border: "1px solid var(--border)",
        borderRadius: 12,
        padding: "12px 16px",
        fontSize: 12.5,
        color: "var(--primary-dark)",
        lineHeight: 1.5
      }}>
        💡 <strong>Peer Network Insight:</strong> High concentration of Red Chilli & Paddy in {network.district} District indicates strong local APMC mandi buyers and transport infrastructure. Consider crop rotation with legumes to preserve soil nitrogen.
      </div>
    </div>
  );
}
