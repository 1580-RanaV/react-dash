import { useState } from "react";
import CustomReportResult, { DeclinedResult } from "../../CustomReportResult";
import { LiveRun } from "./LiveRun";

/* Trigger words: custom-report, custom-report-declined, custom-report-no-embed, add-event */

export function CustomReportBlock({ declined, extraEvent, noEmbed, onSettled }: { declined?: boolean; extraEvent?: boolean; noEmbed?: boolean; onSettled?: () => void }) {
  const [showChart, setShowChart] = useState(false);
  return (
    <div className="flex flex-col gap-4">
      {/* <QueryStages onSettled={() => setTimeout(() => { setShowChart(true); onSettled?.(); }, 400)} /> */}
      <LiveRun onDone={() => setTimeout(() => { setShowChart(true); onSettled?.(); }, 400)} />
      {showChart && (declined ? <DeclinedResult /> : <CustomReportResult extraEvent={extraEvent} noEmbed={noEmbed} />)}
    </div>
  );
}
