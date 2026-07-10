"use client";

import { useMemo, useState } from "react";
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ReferenceDot,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";
import { H2, Stat, cardStyle, GOLD, CHARCOAL, LINE_GREY } from "./ui";
import {
  CHANNELS,
  hill,
  marginal,
  fmt,
  fmtK,
  colourOf,
  buildWeeks,
  buildRoiData,
  buildCurveData,
} from "@/lib/exampleData";

const tooltipStyle = {
  background: "#fff",
  border: `1px solid ${LINE_GREY}`,
  borderRadius: 8,
  fontSize: 12,
  color: "#0A0A0A",
};

const TABS = ["Overview", "Response Curves", "Budget Optimiser"] as const;

export function ExampleModel() {
  const [tab, setTab] = useState<(typeof TABS)[number]>("Overview");
  const [spends, setSpends] = useState(Object.fromEntries(CHANNELS.map((c) => [c.key, c.spend])));

  const weeks = useMemo(() => buildWeeks(), []);
  const roiData = useMemo(() => buildRoiData(), []);
  const curveData = useMemo(() => buildCurveData(), []);

  const currentTotalSpend = CHANNELS.reduce((a, c) => a + c.spend, 0);
  const currentReturn = CHANNELS.reduce((a, c) => a + hill(c.spend, c), 0);
  const scenarioSpend = CHANNELS.reduce((a, c) => a + spends[c.key], 0);
  const scenarioReturn = CHANNELS.reduce((a, c) => a + hill(spends[c.key], c), 0);

  return (
    <>
      <div
        style={{
          background: "#FFF3D6",
          color: "#8A6400",
          borderRadius: 10,
          padding: "10px 16px",
          fontSize: 12,
          fontWeight: 600,
          marginBottom: 20,
        }}
      >
        Example only — synthetic demo data, not a real client result. This is what Model Results
        looks like once a real dataset is approved.
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 4, flexWrap: "wrap" }}>
        {TABS.map((t) => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              background: tab === t ? "#0A0A0A" : "#fff",
              color: tab === t ? GOLD : CHARCOAL,
              border: `1px solid ${tab === t ? "#0A0A0A" : LINE_GREY}`,
              borderRadius: 999,
              padding: "8px 18px",
              fontSize: 12,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              cursor: "pointer",
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <>
          <H2 hint="Data v1, approved. The model decomposes weekly revenue into base (what you'd get anyway) plus the incremental lift from each channel.">
            Model Results — Last 52 Weeks
          </H2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap" }}>
            <Stat label="Modelled revenue" value="$6.2M" sub="52-week total" />
            <Stat label="Media-driven" value="38%" sub="vs 62% base / organic" gold />
            <Stat
              label="Blended ROI"
              value={"$" + (currentReturn / currentTotalSpend).toFixed(2)}
              sub="per media $ · directional (52 wks)"
              gold
            />
            <Stat label="Highest marginal ROI" value="Search" sub="next dollar works hardest here" />
          </div>

          <H2 hint="Stacked contribution over time — this is the chart that ends the 'which channel did it' debate.">
            Revenue Decomposition
          </H2>
          <div style={{ ...cardStyle, padding: "20px 12px 8px" }}>
            <ResponsiveContainer width="100%" height={330}>
              <AreaChart data={weeks}>
                <CartesianGrid stroke="#EFEFEF" vertical={false} />
                <XAxis dataKey="week" tick={{ fill: "#999", fontSize: 10 }} interval={7} />
                <YAxis tick={{ fill: "#999", fontSize: 10 }} tickFormatter={fmtK} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => fmt(Number(v))} />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                <Area type="monotone" dataKey="Base" stackId="1" stroke="#D8D8D8" fill="#EDEDED" />
                {CHANNELS.map((c, i) => (
                  <Area
                    key={c.key}
                    type="monotone"
                    dataKey={c.name}
                    stackId="1"
                    stroke={colourOf(i)}
                    fill={colourOf(i)}
                    fillOpacity={i === 0 ? 0.9 : 0.6}
                  />
                ))}
              </AreaChart>
            </ResponsiveContainer>
          </div>

          <H2 hint="Average return per dollar at current spend. High ROI ≠ spend more — check the response curves for headroom.">
            ROI by Channel
          </H2>
          <div style={{ ...cardStyle, padding: "20px 12px 8px" }}>
            <ResponsiveContainer width="100%" height={280}>
              <BarChart data={roiData} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid stroke="#EFEFEF" horizontal={false} />
                <XAxis type="number" tick={{ fill: "#999", fontSize: 11 }} tickFormatter={(v) => "$" + v} />
                <YAxis type="category" dataKey="name" tick={{ fill: "#0A0A0A", fontSize: 12 }} width={150} />
                <Tooltip contentStyle={tooltipStyle} formatter={(v) => "$" + v + " per $1"} />
                <Bar dataKey="roi" radius={[0, 6, 6, 0]}>
                  {roiData.map((d, i) => (
                    <Cell key={d.name} fill={colourOf(i)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </>
      )}

      {tab === "Response Curves" && (
        <>
          <H2 hint="Every channel saturates. The dot marks current weekly spend — flat curve = over-invested, steep curve = headroom. The single most useful output of an MMM.">
            Saturation / Response Curves
          </H2>
          <div style={{ ...cardStyle, padding: "20px 12px 8px" }}>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={curveData}>
                <CartesianGrid stroke="#EFEFEF" />
                <XAxis dataKey="spend" tick={{ fill: "#999", fontSize: 10 }} tickFormatter={fmtK} />
                <YAxis tick={{ fill: "#999", fontSize: 10 }} tickFormatter={fmtK} />
                <Tooltip
                  contentStyle={tooltipStyle}
                  formatter={(v) => fmt(Number(v))}
                  labelFormatter={(v) => "Spend " + fmt(Number(v))}
                />
                <Legend wrapperStyle={{ fontSize: 11 }} />
                {CHANNELS.map((c, i) => (
                  <Line key={c.key} type="monotone" dataKey={c.name} stroke={colourOf(i)} strokeWidth={i === 0 ? 3 : 2} dot={false} />
                ))}
                {CHANNELS.map((c, i) => (
                  <ReferenceDot
                    key={c.key + "d"}
                    x={Math.round(c.spend / 500) * 500}
                    y={Math.round(hill(Math.round(c.spend / 500) * 500, c))}
                    r={5}
                    fill={colourOf(i)}
                    stroke="#fff"
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div style={{ display: "flex", gap: 14, marginTop: 16, flexWrap: "wrap" }}>
            <Stat label="Most headroom" value="Search" sub="steepest curve at current spend" gold />
            <Stat label="Near saturation" value="Radio" sub="flattening — next $ returns little" />
            <Stat label="Burst channel" value="OOH" sub="works in flights, not always-on" />
          </div>
        </>
      )}

      {tab === "Budget Optimiser" && (
        <>
          <H2 hint="Drag sliders to reallocate weekly budget. Predicted revenue updates live off each channel's fitted response curve.">
            Scenario Planner
          </H2>
          <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 20 }}>
            <Stat label="Scenario spend" value={fmt(scenarioSpend)} sub={`vs ${fmt(currentTotalSpend)} current`} />
            <Stat label="Predicted media revenue" value={fmt(scenarioReturn)} sub={`vs ${fmt(currentReturn)} current`} gold />
            <Stat
              label="Change"
              value={(scenarioReturn >= currentReturn ? "+" : "") + fmt(scenarioReturn - currentReturn).replace("$-", "-$")}
              sub="incremental weekly revenue"
              gold={scenarioReturn >= currentReturn}
            />
          </div>
          <div style={{ ...cardStyle, padding: 24 }}>
            {CHANNELS.map((c, i) => {
              const m = marginal(spends[c.key], c);
              return (
                <div
                  key={c.key}
                  style={{
                    display: "grid",
                    gridTemplateColumns: "170px 1fr 90px 110px",
                    gap: 16,
                    alignItems: "center",
                    padding: "10px 0",
                    borderBottom: i < CHANNELS.length - 1 ? `1px solid ${LINE_GREY}` : "none",
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 600 }}>{c.name}</div>
                  <input
                    type="range"
                    min={0}
                    max={16000}
                    step={250}
                    value={spends[c.key]}
                    onChange={(e) => setSpends({ ...spends, [c.key]: +e.target.value })}
                    style={{ width: "100%", accentColor: GOLD }}
                  />
                  <div style={{ fontSize: 13, fontWeight: 700, color: GOLD, textAlign: "right" }}>
                    {fmtK(spends[c.key])}
                  </div>
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      textAlign: "center",
                      padding: "4px 8px",
                      borderRadius: 999,
                      background: m > 1 ? GOLD : "#F0F0F0",
                      color: m > 1 ? "#0A0A0A" : "#999",
                    }}
                  >
                    {"$" + m.toFixed(2) + "/$"}
                  </div>
                </div>
              );
            })}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 18, alignItems: "center", flexWrap: "wrap", gap: 12 }}>
              <div style={{ fontSize: 11, color: CHARCOAL, letterSpacing: "0.04em", textTransform: "uppercase" }}>
                Badge = marginal return on the next dollar. Gold = still profitable.
              </div>
              <button
                onClick={() => setSpends(Object.fromEntries(CHANNELS.map((c) => [c.key, c.spend])))}
                style={{
                  background: "transparent",
                  border: "1px solid #0A0A0A",
                  color: "#0A0A0A",
                  borderRadius: 999,
                  padding: "8px 18px",
                  fontWeight: 700,
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  cursor: "pointer",
                }}
              >
                Reset to current plan
              </button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
