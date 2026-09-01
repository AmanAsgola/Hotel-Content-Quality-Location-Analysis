import React, { useState, useMemo } from "react";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  Cell, ScatterChart, Scatter, ZAxis,
} from "recharts";

const DATA = {"overall":{"total_hotels":53334,"overall_completeness_pct":84.6,"duplicate_flagged_records":3147,"duplicate_pct_of_catalog":5.9,"sql_first_pass_duplicate_records":2953,"sql_first_pass_duplicate_pct":5.54,"anomaly_total":5886,"anomaly_pct":11.04,"dup_detect_recall_pct":88.2,"dup_detect_precision_pct":55.7},"field_completeness":[{"field":"Description","pct":79.8},{"field":"Amenities","pct":81.3},{"field":"Image","pct":78.3},{"field":"Phone","pct":89.4},{"field":"Email","pct":84.1},{"field":"Website","pct":82.7},{"field":"Rooms","pct":90.4},{"field":"Checkin Time","pct":91.2}],"market_completeness":[{"market":"Africa","hotel_count":3703,"completeness_pct":64.9},{"market":"Latin America","hotel_count":4763,"completeness_pct":75.4},{"market":"APAC","hotel_count":10718,"completeness_pct":79.0},{"market":"Eastern Europe","hotel_count":4382,"completeness_pct":80.4},{"market":"Middle East","hotel_count":4348,"completeness_pct":88.6},{"market":"Western Europe","hotel_count":12622,"completeness_pct":90.8},{"market":"North America","hotel_count":12798,"completeness_pct":92.6}],"category_completeness":[{"category":"Budget","hotel_count":11819,"completeness_pct":77.2},{"category":"Midscale","hotel_count":17604,"completeness_pct":83.0},{"category":"Boutique","hotel_count":5357,"completeness_pct":86.8},{"category":"Upscale","hotel_count":12808,"completeness_pct":89.6},{"category":"Luxury","hotel_count":5746,"completeness_pct":92.0}],"market_category_matrix":[{"market":"APAC","category":"Budget","hotel_count":2350,"completeness_pct":71.6},{"market":"APAC","category":"Midscale","hotel_count":3509,"completeness_pct":77.1},{"market":"APAC","category":"Boutique","hotel_count":1112,"completeness_pct":81.3},{"market":"APAC","category":"Upscale","hotel_count":2626,"completeness_pct":83.8},{"market":"APAC","category":"Luxury","hotel_count":1121,"completeness_pct":86.7},{"market":"Africa","category":"Budget","hotel_count":808,"completeness_pct":57.3},{"market":"Africa","category":"Midscale","hotel_count":1227,"completeness_pct":63.3},{"market":"Africa","category":"Boutique","hotel_count":400,"completeness_pct":66.6},{"market":"Africa","category":"Upscale","hotel_count":859,"completeness_pct":69.7},{"market":"Africa","category":"Luxury","hotel_count":409,"completeness_pct":72.7},{"market":"Eastern Europe","category":"Budget","hotel_count":964,"completeness_pct":73.2},{"market":"Eastern Europe","category":"Midscale","hotel_count":1459,"completeness_pct":78.8},{"market":"Eastern Europe","category":"Boutique","hotel_count":432,"completeness_pct":83.1},{"market":"Eastern Europe","category":"Upscale","hotel_count":1047,"completeness_pct":85.3},{"market":"Eastern Europe","category":"Luxury","hotel_count":480,"completeness_pct":87.2},{"market":"Latin America","category":"Budget","hotel_count":994,"completeness_pct":67.2},{"market":"Latin America","category":"Midscale","hotel_count":1588,"completeness_pct":73.9},{"market":"Latin America","category":"Boutique","hotel_count":475,"completeness_pct":77.4},{"market":"Latin America","category":"Upscale","hotel_count":1146,"completeness_pct":80.4},{"market":"Latin America","category":"Luxury","hotel_count":560,"completeness_pct":82.4},{"market":"Middle East","category":"Budget","hotel_count":1021,"completeness_pct":80.8},{"market":"Middle East","category":"Midscale","hotel_count":1445,"completeness_pct":87.1},{"market":"Middle East","category":"Boutique","hotel_count":409,"completeness_pct":91.1},{"market":"Middle East","category":"Upscale","hotel_count":1039,"completeness_pct":93.8},{"market":"Middle East","category":"Luxury","hotel_count":434,"completeness_pct":96.8},{"market":"North America","category":"Budget","hotel_count":2815,"completeness_pct":85.1},{"market":"North America","category":"Midscale","hotel_count":4198,"completeness_pct":90.9},{"market":"North America","category":"Boutique","hotel_count":1276,"completeness_pct":94.9},{"market":"North America","category":"Upscale","hotel_count":3112,"completeness_pct":97.4},{"market":"North America","category":"Luxury","hotel_count":1397,"completeness_pct":99.5},{"market":"Western Europe","category":"Budget","hotel_count":2867,"completeness_pct":83.2},{"market":"Western Europe","category":"Midscale","hotel_count":4178,"completeness_pct":89.2},{"market":"Western Europe","category":"Boutique","hotel_count":1253,"completeness_pct":93.2},{"market":"Western Europe","category":"Upscale","hotel_count":2979,"completeness_pct":95.8},{"market":"Western Europe","category":"Luxury","hotel_count":1345,"completeness_pct":98.4}],"worst_cities":[{"country":"Morocco","city":"Marrakesh","market":"Africa","hotel_count":394,"completeness_pct":63.2},{"country":"Egypt","city":"Sharm El Sheikh","market":"Africa","hotel_count":401,"completeness_pct":64.2},{"country":"Egypt","city":"Cairo","market":"Africa","hotel_count":420,"completeness_pct":64.3},{"country":"Nigeria","city":"Lagos","market":"Africa","hotel_count":413,"completeness_pct":64.3},{"country":"South Africa","city":"Cape Town","market":"Africa","hotel_count":421,"completeness_pct":65.3},{"country":"South Africa","city":"Johannesburg","market":"Africa","hotel_count":421,"completeness_pct":65.3},{"country":"Morocco","city":"Casablanca","market":"Africa","hotel_count":413,"completeness_pct":65.4},{"country":"Kenya","city":"Nairobi","market":"Africa","hotel_count":406,"completeness_pct":65.5},{"country":"Nigeria","city":"Abuja","market":"Africa","hotel_count":414,"completeness_pct":66.2},{"country":"Brazil","city":"Rio de Janeiro","market":"Latin America","hotel_count":700,"completeness_pct":74.2}],"geo_points":[{"market":"APAC","country":"Australia","city":"Melbourne","hotel_count":511,"latitude":-36.53,"longitude":144.81,"completeness_pct":78.25},{"market":"APAC","country":"Australia","city":"Sydney","hotel_count":532,"latitude":-33.87,"longitude":151.21,"completeness_pct":78.29},{"market":"APAC","country":"China","city":"Beijing","hotel_count":555,"latitude":40.52,"longitude":117.14,"completeness_pct":78.74},{"market":"APAC","country":"China","city":"Shanghai","hotel_count":559,"latitude":32.14,"longitude":122.64,"completeness_pct":77.66},{"market":"APAC","country":"China","city":"Shenzhen","hotel_count":558,"latitude":23.7,"longitude":114.86,"completeness_pct":78.47},{"market":"APAC","country":"India","city":"Bengaluru","hotel_count":502,"latitude":13.81,"longitude":78.96,"completeness_pct":79.93},{"market":"APAC","country":"India","city":"Delhi","hotel_count":538,"latitude":29.27,"longitude":78.59,"completeness_pct":79.32},{"market":"APAC","country":"India","city":"Jaipur","hotel_count":571,"latitude":27.41,"longitude":76.33,"completeness_pct":79.55},{"market":"APAC","country":"India","city":"Mumbai","hotel_count":561,"latitude":19.39,"longitude":73.31,"completeness_pct":78.43},{"market":"APAC","country":"Indonesia","city":"Bali","hotel_count":549,"latitude":-7.92,"longitude":115.57,"completeness_pct":78.71},{"market":"APAC","country":"Indonesia","city":"Jakarta","hotel_count":505,"latitude":-3.92,"longitude":108.99,"completeness_pct":79.23},{"market":"APAC","country":"Japan","city":"Kyoto","hotel_count":527,"latitude":35.1,"longitude":135.47,"completeness_pct":79.6},{"market":"APAC","country":"Japan","city":"Osaka","hotel_count":487,"latitude":35.77,"longitude":135.57,"completeness_pct":79.18},{"market":"APAC","country":"Japan","city":"Tokyo","hotel_count":515,"latitude":36.33,"longitude":139.69,"completeness_pct":79.56},{"market":"APAC","country":"Philippines","city":"Cebu","hotel_count":548,"latitude":11.56,"longitude":124.63,"completeness_pct":79.08},{"market":"APAC","country":"Philippines","city":"Manila","hotel_count":568,"latitude":15.0,"longitude":120.92,"completeness_pct":78.81},{"market":"APAC","country":"Thailand","city":"Bangkok","hotel_count":509,"latitude":14.93,"longitude":101.73,"completeness_pct":78.78},{"market":"APAC","country":"Thailand","city":"Phuket","hotel_count":537,"latitude":8.12,"longitude":98.12,"completeness_pct":78.35},{"market":"APAC","country":"Vietnam","city":"Hanoi","hotel_count":552,"latitude":21.34,"longitude":106.05,"completeness_pct":79.76},{"market":"APAC","country":"Vietnam","city":"Ho Chi Minh City","hotel_count":534,"latitude":11.28,"longitude":106.55,"completeness_pct":79.78},{"market":"Africa","country":"Egypt","city":"Cairo","hotel_count":420,"latitude":30.24,"longitude":32.26,"completeness_pct":64.32},{"market":"Africa","country":"Egypt","city":"Sharm El Sheikh","hotel_count":401,"latitude":29.64,"longitude":39.17,"completeness_pct":64.25},{"market":"Africa","country":"Kenya","city":"Nairobi","hotel_count":406,"latitude":-1.28,"longitude":36.55,"completeness_pct":65.52},{"market":"Africa","country":"Morocco","city":"Casablanca","hotel_count":413,"latitude":34.91,"longitude":-4.43,"completeness_pct":65.38},{"market":"Africa","country":"Morocco","city":"Marrakesh","hotel_count":394,"latitude":32.36,"longitude":-5.54,"completeness_pct":63.17},{"market":"Africa","country":"Nigeria","city":"Abuja","hotel_count":414,"latitude":9.27,"longitude":7.91,"completeness_pct":66.15},{"market":"Africa","country":"Nigeria","city":"Lagos","hotel_count":413,"latitude":7.61,"longitude":6.19,"completeness_pct":64.35},{"market":"Africa","country":"South Africa","city":"Cape Town","hotel_count":421,"latitude":-31.76,"longitude":21.12,"completeness_pct":65.32},{"market":"Africa","country":"South Africa","city":"Johannesburg","hotel_count":421,"latitude":-24.94,"longitude":29.96,"completeness_pct":65.32},{"market":"Eastern Europe","country":"Czechia","city":"Prague","hotel_count":694,"latitude":50.62,"longitude":16.33,"completeness_pct":80.94},{"market":"Eastern Europe","country":"Hungary","city":"Budapest","hotel_count":716,"latitude":47.97,"longitude":20.46,"completeness_pct":80.06},{"market":"Eastern Europe","country":"Poland","city":"Krakow","hotel_count":751,"latitude":50.87,"longitude":23.21,"completeness_pct":80.73},{"market":"Eastern Europe","country":"Poland","city":"Warsaw","hotel_count":712,"latitude":52.53,"longitude":22.84,"completeness_pct":80.21},{"market":"Eastern Europe","country":"Romania","city":"Bucharest","hotel_count":750,"latitude":44.88,"longitude":27.83,"completeness_pct":80.12},{"market":"Eastern Europe","country":"Ukraine","city":"Kyiv","hotel_count":759,"latitude":50.53,"longitude":31.38,"completeness_pct":80.57},{"market":"Latin America","country":"Argentina","city":"Buenos Aires","hotel_count":705,"latitude":-33.82,"longitude":-56.75,"completeness_pct":75.94},{"market":"Latin America","country":"Brazil","city":"Rio de Janeiro","hotel_count":700,"latitude":-22.43,"longitude":-42.48,"completeness_pct":74.2},{"market":"Latin America","country":"Brazil","city":"Sao Paulo","hotel_count":665,"latitude":-22.8,"longitude":-44.93,"completeness_pct":74.92},{"market":"Latin America","country":"Colombia","city":"Bogota","hotel_count":645,"latitude":5.64,"longitude":-70.81,"completeness_pct":76.16},{"market":"Latin America","country":"Colombia","city":"Cartagena","hotel_count":703,"latitude":11.6,"longitude":-71.84,"completeness_pct":75.92},{"market":"Latin America","country":"Mexico","city":"Cancun","hotel_count":665,"latitude":21.41,"longitude":-85.43,"completeness_pct":74.7},{"market":"Latin America","country":"Mexico","city":"Mexico City","hotel_count":680,"latitude":21.02,"longitude":-94.06,"completeness_pct":76.18},{"market":"Middle East","country":"Qatar","city":"Doha","hotel_count":870,"latitude":26.17,"longitude":53.54,"completeness_pct":88.95},{"market":"Middle East","country":"Saudi Arabia","city":"Jeddah","hotel_count":847,"latitude":22.71,"longitude":41.78,"completeness_pct":88.43},{"market":"Middle East","country":"Saudi Arabia","city":"Riyadh","hotel_count":882,"latitude":25.17,"longitude":47.71,"completeness_pct":88.58},{"market":"Middle East","country":"United Arab Emirates","city":"Abu Dhabi","hotel_count":929,"latitude":24.58,"longitude":54.58,"completeness_pct":88.16},{"market":"Middle East","country":"United Arab Emirates","city":"Dubai","hotel_count":820,"latitude":25.66,"longitude":56.09,"completeness_pct":88.81},{"market":"North America","country":"Canada","city":"Montreal","hotel_count":1193,"latitude":45.78,"longitude":-71.01,"completeness_pct":92.56},{"market":"North America","country":"Canada","city":"Toronto","hotel_count":1139,"latitude":44.27,"longitude":-75.83,"completeness_pct":92.42},{"market":"North America","country":"Canada","city":"Vancouver","hotel_count":1123,"latitude":49.56,"longitude":-120.54,"completeness_pct":92.61},{"market":"North America","country":"United States","city":"Chicago","hotel_count":1141,"latitude":42.6,"longitude":-82.82,"completeness_pct":92.94},{"market":"North America","country":"United States","city":"Dallas","hotel_count":1234,"latitude":33.37,"longitude":-93.59,"completeness_pct":92.53},{"market":"North America","country":"United States","city":"Las Vegas","hotel_count":1149,"latitude":36.53,"longitude":-112.65,"completeness_pct":92.91},{"market":"North America","country":"United States","city":"Los Angeles","hotel_count":1188,"latitude":34.65,"longitude":-114.77,"completeness_pct":92.26},{"market":"North America","country":"United States","city":"Miami","hotel_count":1132,"latitude":26.96,"longitude":-75.64,"completeness_pct":92.58},{"market":"North America","country":"United States","city":"New York","hotel_count":1164,"latitude":41.24,"longitude":-71.25,"completeness_pct":92.17},{"market":"North America","country":"United States","city":"Orlando","hotel_count":1133,"latitude":29.0,"longitude":-79.66,"completeness_pct":92.59},{"market":"North America","country":"United States","city":"San Francisco","hotel_count":1202,"latitude":38.46,"longitude":-119.19,"completeness_pct":92.55},{"market":"Western Europe","country":"France","city":"Lyon","hotel_count":812,"latitude":46.03,"longitude":6.38,"completeness_pct":90.53},{"market":"Western Europe","country":"France","city":"Nice","hotel_count":795,"latitude":43.85,"longitude":9.15,"completeness_pct":90.69},{"market":"Western Europe","country":"France","city":"Paris","hotel_count":767,"latitude":49.52,"longitude":5.07,"completeness_pct":91.12},{"market":"Western Europe","country":"Germany","city":"Berlin","hotel_count":771,"latitude":52.57,"longitude":14.28,"completeness_pct":90.43},{"market":"Western Europe","country":"Germany","city":"Frankfurt","hotel_count":764,"latitude":51.03,"longitude":12.05,"completeness_pct":90.8},{"market":"Western Europe","country":"Germany","city":"Munich","hotel_count":805,"latitude":48.17,"longitude":13.0,"completeness_pct":90.99},{"market":"Western Europe","country":"Italy","city":"Milan","hotel_count":746,"latitude":45.85,"longitude":11.38,"completeness_pct":89.98},{"market":"Western Europe","country":"Italy","city":"Rome","hotel_count":813,"latitude":42.05,"longitude":13.07,"completeness_pct":90.65},{"market":"Western Europe","country":"Italy","city":"Venice","hotel_count":788,"latitude":46.24,"longitude":14.8,"completeness_pct":90.88},{"market":"Western Europe","country":"Netherlands","city":"Amsterdam","hotel_count":739,"latitude":52.36,"longitude":6.09,"completeness_pct":90.24},{"market":"Western Europe","country":"Spain","city":"Barcelona","hotel_count":828,"latitude":41.85,"longitude":3.85,"completeness_pct":90.94},{"market":"Western Europe","country":"Spain","city":"Madrid","hotel_count":738,"latitude":41.15,"longitude":-1.99,"completeness_pct":91.45},{"market":"Western Europe","country":"Spain","city":"Seville","hotel_count":846,"latitude":37.74,"longitude":-4.73,"completeness_pct":90.6},{"market":"Western Europe","country":"United Kingdom","city":"Edinburgh","hotel_count":774,"latitude":56.03,"longitude":-1.59,"completeness_pct":90.99},{"market":"Western Europe","country":"United Kingdom","city":"London","hotel_count":814,"latitude":51.87,"longitude":2.05,"completeness_pct":91.26},{"market":"Western Europe","country":"United Kingdom","city":"Manchester","hotel_count":822,"latitude":53.44,"longitude":-1.7,"completeness_pct":91.03}],"anomaly_summary":[{"anomaly_type":"Future-dated last_updated","record_count":3938},{"anomaly_type":"Invalid / null-island coordinates","record_count":632},{"anomaly_type":"Zero / negative nightly rate","record_count":508},{"anomaly_type":"Negative or zero room count","record_count":425},{"anomaly_type":"Placeholder / test description text","record_count":425},{"anomaly_type":"Invalid category / star value","record_count":170}],"freshness":[{"freshness_bucket":"2+ years (stale)","hotel_count":23567,"pct_of_catalog":44.2},{"freshness_bucket":"1-2 years","hotel_count":12898,"pct_of_catalog":24.2},{"freshness_bucket":"6-12 months","hotel_count":6496,"pct_of_catalog":12.2},{"freshness_bucket":"0-6 months","hotel_count":6435,"pct_of_catalog":12.1},{"freshness_bucket":"Future-dated (anomaly)","hotel_count":3938,"pct_of_catalog":7.4}],"inconsistent_country":[{"stored_value":"USA","record_count":57},{"stored_value":"United States of America","record_count":55},{"stored_value":"US","record_count":54},{"stored_value":"UAE","record_count":29},{"stored_value":"Britain","record_count":17},{"stored_value":"UK","record_count":14}],"inconsistent_category":[{"canonical_category":"Boutique","stored_value":"BOUTIQUE","record_count":169},{"canonical_category":"Boutique","stored_value":"Boutique Hotel","record_count":155},{"canonical_category":"Budget","stored_value":"Economy","record_count":238},{"canonical_category":"Budget","stored_value":"2-Star","record_count":222},{"canonical_category":"Budget","stored_value":"budget","record_count":202},{"canonical_category":"Luxury","stored_value":"Five Star","record_count":113},{"canonical_category":"Luxury","stored_value":"LUXURY","record_count":111},{"canonical_category":"Luxury","stored_value":"5-Star","record_count":109},{"canonical_category":"Midscale","stored_value":"3-Star","record_count":546},{"canonical_category":"Midscale","stored_value":"Mid-scale","record_count":536},{"canonical_category":"Upscale","stored_value":"Four Star","record_count":412},{"canonical_category":"Upscale","stored_value":"4-Star","record_count":356}],"regional_outliers":[{"market":"Western Europe","country":"Italy","city":"Milan","hotel_count":746,"completeness_pct":89.98,"market_mean":90.79,"z_score":-2.14},{"market":"APAC","country":"China","city":"Shanghai","hotel_count":559,"completeness_pct":77.66,"market_mean":78.97,"z_score":-2.12},{"market":"Africa","country":"Morocco","city":"Marrakesh","hotel_count":394,"completeness_pct":63.17,"market_mean":64.86,"z_score":-1.87},{"market":"North America","country":"United States","city":"New York","hotel_count":1164,"completeness_pct":92.17,"market_mean":92.56,"z_score":-1.66},{"market":"Latin America","country":"Brazil","city":"Rio de Janeiro","hotel_count":700,"completeness_pct":74.2,"market_mean":75.43,"z_score":-1.53},{"market":"Western Europe","country":"Netherlands","city":"Amsterdam","hotel_count":739,"completeness_pct":90.24,"market_mean":90.79,"z_score":-1.45},{"market":"Middle East","country":"United Arab Emirates","city":"Abu Dhabi","hotel_count":929,"completeness_pct":88.16,"market_mean":88.59,"z_score":-1.36},{"market":"North America","country":"United States","city":"Los Angeles","hotel_count":1188,"completeness_pct":92.26,"market_mean":92.56,"z_score":-1.3}]}
;

const INK = "#1C2B3A";
const INK_SOFT = "#5B6B7A";
const PAPER = "#F1ECE0";
const CARD = "#FBF9F3";
const RULE = "rgba(28,43,58,0.12)";
const CLAY = "#B54B3A";
const GOLD = "#A9822F";
const SAGE = "#4F7A5B";

function hexToRgb(hex) {
  const h = hex.replace("#", "");
  return [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
}
function rgbToHex([r, g, b]) {
  return "#" + [r, g, b].map((v) => Math.round(Math.max(0, Math.min(255, v))).toString(16).padStart(2, "0")).join("");
}
function lerp(a, b, t) { return a + (b - a) * t; }
function lerpColor(c1, c2, t) {
  const a = hexToRgb(c1), b = hexToRgb(c2);
  return rgbToHex([lerp(a[0], b[0], t), lerp(a[1], b[1], t), lerp(a[2], b[2], t)]);
}
// quality color scale: clay (poor) -> gold (fair) -> sage (strong)
function qualityColor(pct) {
  if (pct <= 65) return CLAY;
  if (pct <= 85) return lerpColor(CLAY, GOLD, (pct - 65) / 20);
  if (pct <= 95) return lerpColor(GOLD, SAGE, (pct - 85) / 10);
  return SAGE;
}

const MARKETS = DATA.market_completeness.map((m) => m.market);
const CATEGORIES = DATA.category_completeness.map((c) => c.category);

function weightedView(market, category) {
  const rows = DATA.market_category_matrix.filter(
    (r) => (market === "All" || r.market === market) && (category === "All" || r.category === category)
  );
  const count = rows.reduce((s, r) => s + r.hotel_count, 0);
  const pct = count ? rows.reduce((s, r) => s + r.hotel_count * r.completeness_pct, 0) / count : 0;
  return { count, pct };
}

function SectionHeading({ eyebrow, title, note }) {
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && (
        <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: GOLD, marginBottom: 4, fontWeight: 600 }}>
          {eyebrow}
        </div>
      )}
      <h2 style={{
        fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "clamp(20px,3.2vw,26px)",
        color: INK, margin: 0, lineHeight: 1.25,
      }}>{title}</h2>
      {note && <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: INK_SOFT, fontSize: 14, marginTop: 6, maxWidth: 640, lineHeight: 1.5 }}>{note}</p>}
    </div>
  );
}

function Card({ children, style }) {
  return (
    <div style={{
      background: CARD, border: `1px solid ${RULE}`, borderRadius: 4,
      padding: "18px 20px", ...style,
    }}>{children}</div>
  );
}

function CustomTooltip({ active, payload, label, unit }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div style={{
      background: INK, color: PAPER, padding: "8px 12px", borderRadius: 3,
      fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, lineHeight: 1.5,
    }}>
      {label && <div style={{ fontWeight: 600, marginBottom: 2 }}>{label}</div>}
      {payload.map((p, i) => (
        <div key={i}>{p.name || p.dataKey}: {typeof p.value === "number" ? p.value.toFixed(1) : p.value}{unit || ""}</div>
      ))}
    </div>
  );
}

function CompletenessBar({ data, xKey, labelKey, selected, onSelect, height = 230 }) {
  return (
    <ResponsiveContainer width="100%" height={height}>
      <BarChart data={data} layout="vertical" margin={{ top: 4, right: 28, left: 4, bottom: 4 }}>
        <CartesianGrid strokeDasharray="0" horizontal={false} stroke={RULE} />
        <XAxis type="number" domain={[0, 100]} tick={{ fontFamily: "IBM Plex Sans", fontSize: 12, fill: INK_SOFT }}
          tickFormatter={(v) => v + "%"} axisLine={{ stroke: RULE }} tickLine={false} />
        <YAxis type="category" dataKey={labelKey} width={110}
          tick={{ fontFamily: "IBM Plex Sans", fontSize: 12.5, fill: INK }} axisLine={{ stroke: RULE }} tickLine={false} />
        <Tooltip content={<CustomTooltip unit="%" />} cursor={{ fill: "rgba(28,43,58,0.05)" }} />
        <Bar dataKey={xKey} radius={[0, 3, 3, 0]} maxBarSize={22}
          onClick={(d) => onSelect && onSelect(d[labelKey])} cursor={onSelect ? "pointer" : "default"}>
          {data.map((d, i) => (
            <Cell key={i} fill={qualityColor(d[xKey])}
              opacity={!selected || selected === "All" || d[labelKey] === selected ? 1 : 0.32} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export default function Dashboard() {
  const [market, setMarket] = useState("All");
  const [category, setCategory] = useState("All");
  const view = useMemo(() => weightedView(market, category), [market, category]);

  const worstCities = useMemo(
    () => (market === "All" ? DATA.worst_cities : DATA.worst_cities.filter((c) => c.market === market)),
    [market]
  );

  const lowestMarket = DATA.market_completeness[0];
  const highestMarket = DATA.market_completeness[DATA.market_completeness.length - 1];
  const lowestCategory = DATA.category_completeness[0];
  const futureDated = DATA.anomaly_summary.find((a) => a.anomaly_type.includes("Future-dated"));
  const staleRow = DATA.freshness.find((f) => f.freshness_bucket.includes("stale"));
  const countryVariantTotal = DATA.inconsistent_country.reduce((s, r) => s + r.record_count, 0);

  return (
    <div style={{ background: PAPER, minHeight: "100vh", padding: "0 0 64px" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,400;9..144,500;9..144,600&family=IBM+Plex+Sans:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        * { box-sizing: border-box; }
        select { font-family: 'IBM Plex Sans', sans-serif; }
        table { border-collapse: collapse; width: 100%; }
        th, td { text-align: left; padding: 8px 10px; font-family: 'IBM Plex Sans', sans-serif; font-size: 13px; }
        th { color: ${INK_SOFT}; font-weight: 600; border-bottom: 1px solid ${RULE}; }
        td { color: ${INK}; border-bottom: 1px solid ${RULE}; }
        tr:last-child td { border-bottom: none; }
        .wrap { max-width: 1180px; margin: 0 auto; padding: 0 24px; }
        .grid2 { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; }
      `}</style>

      {/* Masthead */}
      <div style={{ borderBottom: `1px solid ${RULE}`, background: CARD }}>
        <div className="wrap" style={{ padding: "34px 24px 30px" }}>
          <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: GOLD, fontWeight: 600, marginBottom: 6 }}>
            Content operations · catalog audit
          </div>
          <h1 style={{
            fontFamily: "'Fraunces', serif", fontWeight: 500, fontSize: "clamp(28px,5vw,42px)",
            color: INK, margin: 0, lineHeight: 1.1, letterSpacing: "-0.01em",
          }}>Global Hotel Content Registry</h1>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", color: INK_SOFT, fontSize: 15, marginTop: 8, maxWidth: 560, lineHeight: 1.55 }}>
            Content completeness, consistency, and location patterns across {DATA.overall.total_hotels.toLocaleString()} distributed hotel listings.
          </p>

          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginTop: 22 }}>
            <label style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: INK_SOFT }}>
              Market
              <select value={market} onChange={(e) => setMarket(e.target.value)}
                style={{ display: "block", marginTop: 4, padding: "7px 10px", border: `1px solid ${RULE}`, borderRadius: 3, background: PAPER, color: INK, fontSize: 13.5, minWidth: 168 }}>
                <option value="All">All markets</option>
                {MARKETS.map((m) => <option key={m} value={m}>{m}</option>)}
              </select>
            </label>
            <label style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, color: INK_SOFT }}>
              Segment
              <select value={category} onChange={(e) => setCategory(e.target.value)}
                style={{ display: "block", marginTop: 4, padding: "7px 10px", border: `1px solid ${RULE}`, borderRadius: 3, background: PAPER, color: INK, fontSize: 13.5, minWidth: 168 }}>
                <option value="All">All segments</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </label>
            {(market !== "All" || category !== "All") && (
              <button onClick={() => { setMarket("All"); setCategory("All"); }}
                style={{ alignSelf: "flex-end", background: "none", border: "none", color: GOLD, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, cursor: "pointer", padding: "8px 4px", textDecoration: "underline" }}>
                Reset filters
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="wrap">
        {/* Hero KPI row */}
        <div style={{ display: "flex", gap: 28, flexWrap: "wrap", alignItems: "center", padding: "30px 0 8px" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <svg width="112" height="112" viewBox="0 0 112 112">
              <circle cx="56" cy="56" r="48" fill="none" stroke={RULE} strokeWidth="9" />
              <circle cx="56" cy="56" r="48" fill="none" stroke={qualityColor(view.pct)} strokeWidth="9"
                strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 * (1 - view.pct / 100)}
                strokeLinecap="round" transform="rotate(-90 56 56)"
                style={{ transition: "stroke-dashoffset 0.6s ease, stroke 0.6s ease" }} />
              <text x="56" y="52" textAnchor="middle" fontFamily="'IBM Plex Mono', monospace" fontSize="22" fontWeight="600" fill={INK}>
                {view.pct.toFixed(1)}%
              </text>
              <text x="56" y="70" textAnchor="middle" fontFamily="'IBM Plex Sans', sans-serif" fontSize="9.5" fill={INK_SOFT}>
                COMPLETE
              </text>
            </svg>
            <div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 19, color: INK, fontWeight: 500 }}>
                {view.count.toLocaleString()} properties in view
              </div>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13.5, color: INK_SOFT, marginTop: 2 }}>
                {market === "All" ? "All markets" : market} · {category === "All" ? "All segments" : category}
              </div>
            </div>
          </div>

          <div style={{ display: "flex", gap: 26, flexWrap: "wrap", marginLeft: "auto", borderLeft: `1px solid ${RULE}`, paddingLeft: 26 }}>
            <StatChip value={DATA.overall.duplicate_flagged_records.toLocaleString()} label={`duplicate listings (${DATA.overall.duplicate_pct_of_catalog}%)`} />
            <StatChip value={DATA.overall.anomaly_total.toLocaleString()} label={`records with anomalies (${DATA.overall.anomaly_pct}%)`} />
            <StatChip value={DATA.overall.dup_detect_recall_pct + "%"} label="dedup match recall" />
          </div>
        </div>

        {/* Field completeness */}
        <div style={{ padding: "34px 0 8px" }}>
          <SectionHeading eyebrow="Where content is thin" title="Completeness by field"
            note="Share of listings with each attribute populated, across the full catalog." />
          <Card>
            <CompletenessBar
              data={[...DATA.field_completeness].sort((a, b) => a.pct - b.pct)}
              xKey="pct" labelKey="field" height={260} />
          </Card>
        </div>

        {/* Market + Category completeness */}
        <div style={{ padding: "34px 0 8px" }}>
          <SectionHeading eyebrow="Geographic & segment pattern" title="Completeness by market and segment"
            note="Click a bar to filter the dashboard. Emerging markets and lower-tier segments lag furthest." />
          <div className="grid2">
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 10 }}>By market</div>
              <CompletenessBar data={DATA.market_completeness} xKey="completeness_pct" labelKey="market"
                selected={market} onSelect={(m) => setMarket(market === m ? "All" : m)} />
            </Card>
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 10 }}>By segment</div>
              <CompletenessBar data={DATA.category_completeness} xKey="completeness_pct" labelKey="category"
                selected={category} onSelect={(c) => setCategory(category === c ? "All" : c)} />
            </Card>
          </div>
        </div>

        {/* Geographic scatter */}
        <div style={{ padding: "34px 0 8px" }}>
          <SectionHeading eyebrow="Location pattern" title="Where the gaps cluster"
            note="Every dot is a city; position is its coordinates, color is completeness, size is catalog size. Selecting a market above dims the rest." />
          <Card>
            <ResponsiveContainer width="100%" height={340}>
              <ScatterChart margin={{ top: 10, right: 18, left: -10, bottom: 4 }}>
                <CartesianGrid stroke={RULE} />
                <XAxis type="number" dataKey="longitude" domain={[-180, 180]} tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: INK_SOFT }} axisLine={{ stroke: RULE }} tickLine={false} />
                <YAxis type="number" dataKey="latitude" domain={[-60, 75]} tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: INK_SOFT }} axisLine={{ stroke: RULE }} tickLine={false} />
                <ZAxis type="number" dataKey="hotel_count" range={[40, 340]} />
                <Tooltip content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const d = payload[0].payload;
                  return (
                    <div style={{ background: INK, color: PAPER, padding: "8px 12px", borderRadius: 3, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13 }}>
                      <div style={{ fontWeight: 600 }}>{d.city}, {d.country}</div>
                      <div>{d.market} · {d.hotel_count} properties</div>
                      <div>{d.completeness_pct}% complete</div>
                    </div>
                  );
                }} />
                <Scatter data={DATA.geo_points}>
                  {DATA.geo_points.map((d, i) => (
                    <Cell key={i} fill={qualityColor(d.completeness_pct)}
                      opacity={!market || market === "All" || d.market === market ? 0.85 : 0.12} />
                  ))}
                </Scatter>
              </ScatterChart>
            </ResponsiveContainer>
          </Card>
        </div>

        {/* Worst cities + regional outliers */}
        <div style={{ padding: "34px 0 8px" }}>
          <SectionHeading eyebrow="Surfaced findings" title="Locations to prioritize"
            note="Left: lowest raw completeness (min. 40 listings). Right: cities that under-perform their own region's norm — a signal even inside otherwise-healthy markets." />
          <div className="grid2">
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>Weakest overall</div>
              <table>
                <thead><tr><th>City</th><th>Market</th><th style={{ textAlign: "right" }}>Complete</th></tr></thead>
                <tbody>
                  {worstCities.map((c, i) => (
                    <tr key={i}>
                      <td>{c.city}<div style={{ fontSize: 11.5, color: INK_SOFT }}>{c.country}</div></td>
                      <td style={{ color: INK_SOFT }}>{c.market}</td>
                      <td style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: qualityColor(c.completeness_pct) }}>{c.completeness_pct}%</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>Regional outliers</div>
              <table>
                <thead><tr><th>City</th><th style={{ textAlign: "right" }}>Vs. region</th><th style={{ textAlign: "right" }}>z-score</th></tr></thead>
                <tbody>
                  {DATA.regional_outliers.map((c, i) => (
                    <tr key={i}>
                      <td>{c.city}<div style={{ fontSize: 11.5, color: INK_SOFT }}>{c.market}</div></td>
                      <td style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{c.completeness_pct}% <span style={{ color: INK_SOFT }}>of {c.market_mean}%</span></td>
                      <td style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace", color: CLAY }}>{c.z_score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </Card>
          </div>
        </div>

        {/* Anomalies + freshness */}
        <div style={{ padding: "34px 0 8px" }}>
          <SectionHeading eyebrow="Data integrity" title="Anomalies and content freshness"
            note="Rule-based checks on geography, pricing, dates, and placeholder text; plus how recently each listing's content was last touched." />
          <div className="grid2">
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 10 }}>Anomaly type</div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={DATA.anomaly_summary} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="0" horizontal={false} stroke={RULE} />
                  <XAxis type="number" tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: INK_SOFT }} axisLine={{ stroke: RULE }} tickLine={false} />
                  <YAxis type="category" dataKey="anomaly_type" width={150} tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: INK }} axisLine={{ stroke: RULE }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(28,43,58,0.05)" }} />
                  <Bar dataKey="record_count" fill={CLAY} radius={[0, 3, 3, 0]} maxBarSize={18} />
                </BarChart>
              </ResponsiveContainer>
            </Card>
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 10 }}>Last content update</div>
              <ResponsiveContainer width="100%" height={210}>
                <BarChart data={DATA.freshness} layout="vertical" margin={{ top: 4, right: 20, left: 4, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="0" horizontal={false} stroke={RULE} />
                  <XAxis type="number" tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: INK_SOFT }} axisLine={{ stroke: RULE }} tickLine={false} />
                  <YAxis type="category" dataKey="freshness_bucket" width={150} tick={{ fontFamily: "IBM Plex Sans", fontSize: 11, fill: INK }} axisLine={{ stroke: RULE }} tickLine={false} />
                  <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(28,43,58,0.05)" }} />
                  <Bar dataKey="hotel_count" radius={[0, 3, 3, 0]} maxBarSize={18}>
                    {DATA.freshness.map((d, i) => (
                      <Cell key={i} fill={d.freshness_bucket.includes("Future") ? CLAY : d.freshness_bucket.includes("stale") ? GOLD : SAGE} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Card>
          </div>
        </div>

        {/* Inconsistencies */}
        <div style={{ padding: "34px 0 8px" }}>
          <SectionHeading eyebrow="Data integrity" title="Inconsistent value representations"
            note="Same real-world value, stored under more than one label — a standardization gap rather than a missing-data gap." />
          <div className="grid2">
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>Country name variants</div>
              <table>
                <thead><tr><th>Stored as</th><th style={{ textAlign: "right" }}>Records</th></tr></thead>
                <tbody>{DATA.inconsistent_country.map((r, i) => (
                  <tr key={i}><td>{r.stored_value}</td><td style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.record_count}</td></tr>
                ))}</tbody>
              </table>
            </Card>
            <Card>
              <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 13, fontWeight: 600, color: INK, marginBottom: 6 }}>Segment label variants</div>
              <table>
                <thead><tr><th>Stored as</th><th>Canonical</th><th style={{ textAlign: "right" }}>Records</th></tr></thead>
                <tbody>{DATA.inconsistent_category.map((r, i) => (
                  <tr key={i}><td>{r.stored_value}</td><td style={{ color: INK_SOFT }}>{r.canonical_category}</td><td style={{ textAlign: "right", fontFamily: "'IBM Plex Mono', monospace" }}>{r.record_count}</td></tr>
                ))}</tbody>
              </table>
            </Card>
          </div>
        </div>

        {/* Improvement opportunities */}
        <div style={{ padding: "34px 0 8px" }}>
          <SectionHeading eyebrow="Recommendations" title="Improvement opportunities" />
          <Card style={{ background: INK }}>
            <ul style={{ margin: 0, padding: "2px 0 2px 20px", color: PAPER, fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 14, lineHeight: 1.85 }}>
              <li>{lowestMarket.market} listings average {lowestMarket.completeness_pct}% completeness against {highestMarket.completeness_pct}% in {highestMarket.market} — a {(highestMarket.completeness_pct - lowestMarket.completeness_pct).toFixed(1)}-point gap. Start a content-refresh sprint there, prioritizing {lowestCategory.category} and Midscale listings, which lag furthest industry-wide.</li>
              <li>{DATA.overall.duplicate_flagged_records.toLocaleString()} records ({DATA.overall.duplicate_pct_of_catalog}%) look like duplicate listings from overlapping vendor feeds. Geo-proximity + fuzzy name matching recovers ~{DATA.overall.dup_detect_recall_pct}% automatically, but roughly {(100 - DATA.overall.dup_detect_precision_pct).toFixed(0)}% of auto-flagged pairs still need human review before merging — treat it as triage, not auto-merge.</li>
              <li>{futureDated ? futureDated.record_count.toLocaleString() : ""} records carry a future-dated last-updated timestamp. Add ingestion-time validation to reject dates outside a sane rolling window.</li>
              <li>{countryVariantTotal} records store country under a non-canonical spelling (USA/US/UK/UAE, etc.). Normalize free-text market fields against a controlled vocabulary at ingestion, not after the fact.</li>
              <li>{staleRow ? staleRow.pct_of_catalog : ""}% of the catalog hasn't been touched in 2+ years. Schedule recurring re-verification, weighted toward the lowest-completeness markets first.</li>
            </ul>
          </Card>
        </div>

        {/* Methodology footer */}
        <div style={{ padding: "30px 0 10px", borderTop: `1px solid ${RULE}`, marginTop: 20 }}>
          <p style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12.5, color: INK_SOFT, lineHeight: 1.6, maxWidth: 720 }}>
            Methodology: completeness KPIs aggregated in SQL across 8 core content fields (description, amenities,
            primary image, phone, email, website, room count, check-in time). Duplicate detection runs two passes: a
            SQL first pass grouping on exact name + coarse (~1km) coordinates flags {DATA.overall.sql_first_pass_duplicate_records.toLocaleString()}{" "}
            records ({DATA.overall.sql_first_pass_duplicate_pct}%) — cheap enough to run nightly; a pandas fuzzy
            name-matching pass within the same geo buckets then catches near-matches the exact pass misses, flagging{" "}
            {DATA.overall.duplicate_flagged_records.toLocaleString()} records ({DATA.overall.duplicate_pct_of_catalog}%),
            benchmarked at {DATA.overall.dup_detect_recall_pct}% recall / {DATA.overall.dup_detect_precision_pct}% precision
            against a held-out labeled sample. Anomaly detection is rule-based (geo bounds, pricing, dates, placeholder
            text, category vocabulary) computed directly from field values — no pre-flagged labels. Dataset is a
            synthetically generated catalog of {DATA.overall.total_hotels.toLocaleString()} listings built to model
            realistic, market-correlated content-quality patterns for this project.
          </p>
        </div>
      </div>
    </div>
  );
}

function StatChip({ value, label }) {
  return (
    <div>
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 20, fontWeight: 600, color: INK }}>{value}</div>
      <div style={{ fontFamily: "'IBM Plex Sans', sans-serif", fontSize: 12, color: INK_SOFT, marginTop: 2, maxWidth: 150, lineHeight: 1.35 }}>{label}</div>
    </div>
  );
}
