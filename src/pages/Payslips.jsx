import React, { useState } from "react";
import {
  Download,
  Wallet,
  Send,
  Upload,
  Search,
  FileText,
  CheckCircle2,
  AlertCircle,
  X,
  File,
} from "lucide-react";
import { C, fontMono, fontSerif } from "../theme";
import { SectionTitle } from "../components/ui";
import { useApp } from "../context/AppContext";

const currency = (n) => `R ${n.toLocaleString("en-ZA")}`;

function parsePayslipText(text) {
  const employeeMatch = text.match(/Employee:\s*(.+)/i);
  const monthMatch = text.match(/Month:\s*(.+)/i);
  const issuedMatch = text.match(/Issued:\s*(.+)/i);
  const basicMatch = text.match(/Basic salary:\s*R\s*([\d,. ]+)/i);
  const allowancesMatch = text.match(/Allowances:\s*R\s*([\d,. ]+)/i);
  const deductionsMatch = text.match(/Deductions:\s*-?\s*R\s*([\d,. ]+)/i);
  const netMatch = text.match(/Net pay:\s*R\s*([\d,. ]+)/i);

  const num = (s) => (s ? parseFloat(s.replace(/[, ]/g, "")) : null);

  return {
    employeeName: employeeMatch ? employeeMatch[1].trim() : null,
    month: monthMatch ? monthMatch[1].trim() : null,
    issued: issuedMatch ? issuedMatch[1].trim() : null,
    basic: num(basicMatch?.[1]),
    allowances: num(allowancesMatch?.[1]),
    deductions: num(deductionsMatch?.[1]),
    net: num(netMatch?.[1]),
  };
}

function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = () => reject(new Error("Could not read file"));
    reader.readAsText(file);
  });
}

function downloadPayslip(p, employeeName) {
  const text = `PAYSLIP\n\nEmployee: ${employeeName}\nMonth: ${p.month}\nIssued: ${p.issued}\n\nBasic salary: ${currency(p.basic)}\nAllowances: ${currency(p.allowances)}\nDeductions: -${currency(p.deductions)}\n----------------------------\nNet pay: ${currency(p.net)}\n`;
  const blob = new Blob([text], { type: "text/plain" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `${employeeName.replace(/\s+/g, "_")}_${p.month.replace(/\s+/g, "_")}_payslip.txt`;
  a.click();
  URL.revokeObjectURL(url);
}

function PayslipCard({
  p,
  employeeName,
  isProcessor,
  onSend,
  sentPayslips,
  payslipFileMap,
  searchQuery,
}) {
  const isSent = sentPayslips.has(p.id);
  const uploaded = payslipFileMap[p.id];
  const income = p.basic + p.allowances;

  function highlightText(text, q) {
    if (!q) return text;
    const escaped = q.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));

    return parts.map((part, i) =>
      part.toLowerCase() === q.toLowerCase() ? (
        <mark
          key={i}
          className="bg-tealSoft text-ink rounded-sm px-0.5"
        >
          {part}
        </mark>
      ) : (
        part
      )
    );
  }

  return (
    <tr>
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 bg-brassSoft text-brass">
            <Wallet size={15} />
          </div>

          <div className="min-w-0">
            <p className="text-sm">
              {highlightText(p.month, searchQuery)}
            </p>

            {isSent && (
              <p className="text-[10px] text-teal mt-0.5">
                Sent to employee
              </p>
            )}

            {uploaded && (
              <p className="text-[10px] text-brass mt-0.5 truncate max-w-[220px]">
                File uploaded: {uploaded.file.name}
              </p>
            )}
          </div>
        </div>
      </td>

      <td className="px-4 py-3 text-sm font-mono">
        {currency(income)}
      </td>

      <td className="px-4 py-3 text-xs text-muted font-mono">
        {p.issued}
      </td>

      <td className="px-4 py-3 text-sm font-mono">
        {currency(p.deductions)}
      </td>

      <td className="px-4 py-3 text-sm font-mono font-semibold">
        {currency(p.net)}
      </td>

      <td className="px-4 py-3">
        <span
          className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg font-mono ${p.status === "Paid"
            ? "text-teal bg-tealSoft"
            : "text-brass bg-brassSoft"
            }`}
        >
          {highlightText(p.status, searchQuery)}
        </span>
      </td>

      <td className="px-4 py-3">
        <div className="flex items-center gap-2 shrink-0">
          {isProcessor && uploaded && !isSent && (
            <button
              onClick={() => onSend(p.id)}
              className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg border border-line text-muted hover:text-ink transition-colors"
            >
              <Send size={13} />
              Send
            </button>
          )}

          <button
            onClick={() => downloadPayslip(p, employeeName)}
            disabled={p.status === "Pending"}
            className={`flex items-center justify-center gap-1.5 text-xs px-3 py-2 rounded-lg border shrink-0 w-24 ${p.status === "Pending"
              ? "border-line text-muted opacity-50 cursor-not-allowed"
              : "border-line text-muted"
              }`}
          >
            <Download size={13} />
            Download
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function Payslips() {
  const { role, currentEmployee, employees, payslips } = useApp();

  const isProcessor = role === "Admin" || role === "HR Manager";

  const [selectedId, setSelectedId] = useState(
    currentEmployee?.id || employees?.[0]?.id || ""
  );

  const [sentPayslips, setSentPayslips] = useState(new Set());
  const [payslipFileMap, setPayslipFileMap] = useState({});
  const [search, setSearch] = useState("");


  const [bulkFiles, setBulkFiles] = useState([]);
  const [isReading, setIsReading] = useState(false);
  const [readProgress, setReadProgress] = useState({ current: 0, total: 0, fileName: "", step: "" });
  const [bulkProcessed, setBulkProcessed] = useState(false);
  const [bulkSending, setBulkSending] = useState(false);
  const [bulkSent, setBulkSent] = useState(false);

  const targetEmployee = employees.find((e) => e.id === selectedId);

  const list = payslips
    .filter((p) => {
      if (p.employeeId !== selectedId) return false;

      if (!search) return true;

      return (
        p.month.toLowerCase().includes(search.toLowerCase()) ||
        p.status.toLowerCase().includes(search.toLowerCase())
      );
    })
    .sort((a, b) => (a.issued < b.issued ? 1 : -1));

  const latestIssueDate =
    payslips.length > 0
      ? payslips.reduce(
        (latest, p) => (p.issued > latest ? p.issued : latest),
        payslips[0].issued
      )
      : null;

  const handleSend = (payslipId) => {
    setSentPayslips((prev) => new Set(prev).add(payslipId));
  };


  const handleBulkUpload = (e) => {
    const files = Array.from(e.target.files || []);

    if (!files.length) return;

    const formattedFiles = files.map((file, index) => ({
      id: `${Date.now()}-${index}`,
      file,
      parsed: null,
      matchedEmployee: null,
      matchedPayslip: null,
      status: "ready",
      reason: "",
    }));

    setBulkFiles((prev) => [...prev, ...formattedFiles]);
    setBulkProcessed(false);
    setBulkSent(false);
    setReadProgress({ current: 0, total: 0, fileName: "", step: "" });
  };


  const handleReadFiles = async () => {
    if (!bulkFiles.length) return;

    setIsReading(true);
    setBulkProcessed(false);
    setBulkSent(false);

    const alreadyUploadedSet = new Set(
      Object.keys(payslipFileMap).map((id) => id + "|" + payslips.find((p) => p.id === id)?.month)
    );

    const updatedFiles = [];

    for (let i = 0; i < bulkFiles.length; i++) {
      const item = bulkFiles[i];

      setReadProgress({
        current: i + 1,
        total: bulkFiles.length,
        fileName: item.file.name,
        step: "Reading file content",
      });

      try {
        const text = await readFileAsText(item.file);

        setReadProgress((prev) => ({ ...prev, step: "Parsing payslip data" }));
        const parsed = parsePayslipText(text);

        const hasContent = parsed.employeeName || parsed.month;
        if (!hasContent) {
          updatedFiles.push({
            ...item,
            parsed,
            status: "unmatched",
            reason: "Could not read payslip data from this file.",
          });
          continue;
        }

        setReadProgress((prev) => ({ ...prev, step: "Matching employee" }));
        let matchedEmployee = null;
        if (parsed.employeeName) {
          matchedEmployee = employees.find(
            (e) =>
              e.name.toLowerCase() === parsed.employeeName.toLowerCase() ||
              e.name.toLowerCase().includes(parsed.employeeName.toLowerCase())
          );
        }

        if (!matchedEmployee) {
          updatedFiles.push({
            ...item,
            parsed,
            matchedEmployee: null,
            status: "unmatched",
            reason: `No employee found matching "${parsed.employeeName}".`,
          });
          continue;
        }

        let matchedPayslip = null;
        if (parsed.month) {
          matchedPayslip = payslips.find(
            (p) =>
              p.employeeId === matchedEmployee.id &&
              p.month.toLowerCase() === parsed.month.toLowerCase()
          );
        } else if (parsed.issued) {
          matchedPayslip = payslips.find(
            (p) =>
              p.employeeId === matchedEmployee.id &&
              p.issued === parsed.issued
          );
        }

        if (!matchedPayslip) {
          const period = parsed.month || parsed.issued || "unknown period";
          updatedFiles.push({
            ...item,
            parsed,
            matchedEmployee,
            matchedPayslip: null,
            status: "unmatched",
            reason: `No payslip found for ${matchedEmployee.name} in ${period}.`,
          });
          continue;
        }

        setReadProgress((prev) => ({ ...prev, step: "Checking upload status" }));

        const key = matchedPayslip.id + "|" + matchedPayslip.month;
        const isAlreadyUploaded = alreadyUploadedSet.has(key);

        if (isAlreadyUploaded) {
          updatedFiles.push({
            ...item,
            parsed,
            matchedEmployee,
            matchedPayslip,
            status: "already",
            reason: `Payslip for ${matchedPayslip.month} already uploaded.`,
          });
        } else {
          alreadyUploadedSet.add(key);
          updatedFiles.push({
            ...item,
            parsed,
            matchedEmployee,
            matchedPayslip,
            status: "matched",
            reason: "",
          });
        }
      } catch {
        updatedFiles.push({
          ...item,
          parsed: null,
          status: "unmatched",
          reason: "Could not read file content.",
        });
      }
    }

    setBulkFiles(updatedFiles);
    setReadProgress({ current: bulkFiles.length, total: bulkFiles.length, fileName: "", step: "Complete" });
    setIsReading(false);
    setBulkProcessed(true);

    setPayslipFileMap((prev) => {
      const next = { ...prev };
      updatedFiles.forEach((item) => {
        if (item.status === "matched" && item.matchedPayslip) {
          next[item.matchedPayslip.id] = { file: item.file, parsed: item.parsed };
        }
      });
      return next;
    });
  };


  const handleSendAll = () => {
    if (!bulkFiles.length) return;

    setBulkSending(true);

    setTimeout(() => {
      setBulkSending(false);
      setBulkSent(true);

      const newSent = new Set(sentPayslips);

      bulkFiles.forEach((file) => {
        if (file.status === "matched" && file.matchedPayslip) {
          newSent.add(file.matchedPayslip.id);
        }
      });

      setSentPayslips(newSent);
    }, 1200);
  };

  const removeBulkFile = (id) => {
    setBulkFiles((prev) => prev.filter((file) => file.id !== id));
    setBulkProcessed(false);
    setBulkSent(false);
  };

  const matchedCount = bulkFiles.filter((f) => f.status === "matched").length;
  const unmatchedCount = bulkFiles.filter((f) => f.status === "unmatched").length;
  const alreadyCount = bulkFiles.filter((f) => f.status === "already").length;

  return (
    <div className="space-y-4">
      <div className="head">
        <SectionTitle eyebrow="Pay Register" title="Payslips" />
      </div>

      {isProcessor && latestIssueDate && (
        <div className="rounded-xl border p-4 bg-card border-line flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 text-teal">
            <svg
              width="25"
              height="25"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="3" y="4" width="18" height="18" rx="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>

          <div>
            <p className="text-xs text-muted">
              Batch issued to all employees
            </p>
            <p className="text-sm font-semibold font-mono">
              {latestIssueDate}
            </p>
          </div>
        </div>
      )}

      {isProcessor && (
        <div className="rounded-xl border card card-border overflow-hidden">
          <div className="px-5 py-4 border-b border-line flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-brassSoft text-brass flex items-center justify-center">
                  <FileText size={20} />
                </div>

                <h3 className="text-sm font-semibold">
                  Bulk Payslip Distribution
                </h3>
              </div>

              <p className="text-xs text-muted mt-1">
                Upload all employee payslips and match them automatically.
              </p>
            </div>

            {bulkFiles.length > 0 && (
              <span className="text-xs font-mono px-2.5 py-1.5 rounded-lg bg-tealSoft text-teal">
                {bulkFiles.length} file{bulkFiles.length !== 1 ? "s" : ""}
              </span>
            )}
          </div>

          <div className="p-5 space-y-4">
            <label className="block cursor-pointer">
              <div className="border border-dashed border-line rounded-xl p-8 flex flex-col items-center justify-center text-center hover:border-brass transition-colors">
                <div className="w-11 h-11 rounded-xl bg-brassSoft text-brass flex items-center justify-center mb-3">
                  <Upload size={19} />
                </div>

                <p className="text-sm font-medium">
                  Upload payslip PDFs
                </p>

                <p className="text-xs text-muted mt-1">
                  Select multiple files at once
                </p>

                <span className="mt-3 text-xs px-3 py-1.5 rounded-lg border border-line text-muted">
                  Choose files
                </span>
              </div>

              <input
                type="file"
                multiple
                accept=".pdf,.txt,application/pdf,text/plain"
                className="hidden"
                onChange={handleBulkUpload}
              />
            </label>

            {bulkFiles.length > 0 && (
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-muted font-mono">
                    Uploaded files
                  </p>

                  <p className="text-[10px] text-muted">
                    {bulkFiles.length} selected
                  </p>
                </div>

                <div className="border border-line rounded-xl overflow-hidden">
                  {bulkFiles.map((item) => {
                    const matchedPayslip = item.matchedPayslip;
                    const isLinked = matchedPayslip && payslipFileMap[matchedPayslip.id];

                    return (
                      <div
                        key={item.id}
                        className="flex items-center gap-3 px-4 py-3 border-b border-line last:border-b-0"
                      >
                        <div className="w-8 h-8 rounded-lg bg-brassSoft text-brass flex items-center justify-center shrink-0">
                          <FileText size={14} />
                        </div>

                        <div className="min-w-0 flex-1">
                          <p className="text-sm truncate">
                            {item.file.name}
                          </p>

                          <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                            <span className="text-[10px] text-muted">
                              {(item.file.size / 1024).toFixed(0)} KB
                            </span>

                            <span className="text-[10px] text-muted">
                              •
                            </span>

                            <span className="text-[10px] text-teal">
                              {item.matchedEmployee
                                ? item.matchedEmployee.name
                                : item.parsed?.employeeName || "Unknown employee"}
                            </span>

                            {item.parsed?.month && (
                              <>
                                <span className="text-[10px] text-muted">
                                  •
                                </span>
                                <span className="text-[10px] text-muted">
                                  {item.parsed.month}
                                </span>
                              </>
                            )}

                            {item.parsed?.issued && (
                              <>
                                <span className="text-[10px] text-muted">
                                  •
                                </span>
                                <span className="text-[10px] text-muted">
                                  {item.parsed.issued}
                                </span>
                              </>
                            )}
                          </div>

                          {item.status === "unmatched" && item.reason && (
                            <div className="flex items-start gap-1.5 mt-1.5 text-[10px] text-rust">
                              <AlertCircle size={11} className="shrink-0 mt-0.5" />
                              <span>{item.reason}</span>
                            </div>
                          )}

                          {item.status === "already" && (
                            <div className="flex items-start gap-1.5 mt-1.5 text-[10px] text-brass">
                              <AlertCircle size={11} className="shrink-0 mt-0.5" />
                              <span>{item.reason}</span>
                            </div>
                          )}

                          {item.status === "matched" && !isLinked && (
                            <div className="flex items-start gap-1.5 mt-1.5 text-[10px] text-teal">
                              <CheckCircle2 size={11} className="shrink-0 mt-0.5" />
                              <span>Matched to payslip entry</span>
                            </div>
                          )}

                          {item.status === "matched" && isLinked && (
                            <div className="flex items-start gap-1.5 mt-1.5 text-[10px] text-brass">
                              <CheckCircle2 size={11} className="shrink-0 mt-0.5" />
                              <span>Linked to payslip table</span>
                            </div>
                          )}
                        </div>

                        <div className="shrink-0">
                          {item.status === "matched" && !isLinked ? (
                            <span className="flex items-center gap-1.5 text-[10px] text-teal bg-tealSoft px-2.5 py-1.5 rounded-lg">
                              <CheckCircle2 size={12} />
                              Matched
                            </span>
                          ) : item.status === "already" ? (
                            <span className="flex items-center gap-1.5 text-[10px] text-brass bg-brassSoft/20 px-2.5 py-1.5 rounded-lg">
                              <AlertCircle size={12} />
                              Already uploaded
                            </span>
                          ) : item.status === "unmatched" ? (
                            <span className="flex items-center gap-1.5 text-[10px] text-rust bg-rustSoft px-2.5 py-1.5 rounded-lg">
                              <AlertCircle size={12} />
                              Unmatched
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[10px] text-muted px-2.5 py-1.5 rounded-lg bg-paper border border-line">
                              <File size={12} />
                              Ready
                            </span>
                          )}
                        </div>

                        {item.status !== "matched" && (
                          <button
                            onClick={() => removeBulkFile(item.id)}
                            className="text-muted hover:text-ink transition-colors shrink-0"
                            title="Remove"
                          >
                            <X size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}


            {isReading && (
              <div className="rounded-lg bg-paper border border-line px-4 py-3 flex items-center gap-3">
                <div className="w-7 h-7 rounded-lg bg-brassSoft text-brass flex items-center justify-center">
                  <FileText size={13} />
                </div>

                <div className="flex-1">
                  <p className="text-xs font-medium">
                    Reading payslips...
                  </p>
                  <p className="text-[10px] text-muted mt-0.5">
                    {readProgress.fileName
                      ? `${readProgress.fileName} — ${readProgress.step}`
                      : "Processing files..."}
                  </p>
                  <p className="text-[10px] text-muted">
                    File {readProgress.current} of {readProgress.total}
                  </p>
                </div>

                <div className="w-4 h-4 border-2 border-brass border-t-transparent rounded-full animate-spin" />
              </div>
            )}


            {bulkProcessed && !isReading && bulkFiles.length > 0 && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="rounded-lg border border-line p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-mono">
                      Uploaded
                    </p>
                    <p className="text-lg font-semibold font-mono mt-1">
                      {bulkFiles.length}
                    </p>
                  </div>

                  <div className="rounded-lg border border-line p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-mono">
                      Matched
                    </p>
                    <p className="text-lg font-semibold font-mono mt-1 text-teal">
                      {matchedCount}
                    </p>
                  </div>

                  <div className="rounded-lg border border-line p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-mono">
                      Already uploaded
                    </p>
                    <p className="text-lg font-semibold font-mono mt-1 text-brass">
                      {alreadyCount}
                    </p>
                  </div>

                  <div className="rounded-lg border border-line p-3">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-mono">
                      Unmatched
                    </p>
                    <p className="text-lg font-semibold font-mono mt-1 text-rust">
                      {unmatchedCount}
                    </p>
                  </div>
                </div>

                {(unmatchedCount > 0 || alreadyCount > 0) && (
                  <div className="rounded-lg border border-line p-3 space-y-1.5">
                    <p className="text-[10px] uppercase tracking-wider text-muted font-mono flex items-center gap-1.5">
                      <AlertCircle size={11} />
                      Issues detected
                    </p>
                    {bulkFiles
                      .filter((f) => f.status === "unmatched" || f.status === "already")
                      .map((f) => (
                        <div
                          key={f.id}
                          className="text-xs text-muted flex items-start gap-2"
                        >
                          <span className="font-mono truncate max-w-xs">
                            {f.file.name}
                          </span>
                          <span className="text-rust">—</span>
                          <span>{f.reason}</span>
                        </div>
                      ))}
                  </div>
                )}

                {matchedCount > 0 && (
                  <div className="flex items-start gap-2.5 text-xs text-teal bg-tealSoft px-3 py-2 rounded-lg">
                    <CheckCircle2 size={13} className="shrink-0 mt-0.5" />
                    <p>
                      {matchedCount} file
                      {matchedCount !== 1 ? "s" : ""} matched to payslip{" "}
                      {matchedCount !== 1 ? "entries" : "entry"}. The payslip table has been updated below.
                    </p>
                  </div>
                )}
              </div>
            )}

            {bulkSent && (
              <div className="rounded-lg bg-tealSoft border border-teal/20 px-4 py-3 flex items-center gap-3">
                <CheckCircle2 size={17} className="text-teal shrink-0" />

                <div>
                  <p className="text-xs font-semibold text-teal">
                    Payslips sent successfully
                  </p>

                  <p className="text-[10px] text-muted mt-0.5">
                    {bulkFiles.length} employee
                    {bulkFiles.length !== 1 ? "s" : ""} received their payslip.
                  </p>
                </div>
              </div>
            )}

            {bulkFiles.length > 0 && !bulkSent && (
              <div className="flex flex-wrap justify-end gap-2 pt-1">
                {!bulkProcessed ? (
                  <button
                    onClick={handleReadFiles}
                    disabled={isReading}
                    className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg bg-ink text-paper hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Search size={13} />
                    {isReading ? "Reading..." : "Read & Match"}
                  </button>
                ) : (
                  <button
                    onClick={handleSendAll}
                    disabled={bulkSending || matchedCount === 0}
                    className="flex items-center gap-2 text-xs px-4 py-2.5 rounded-lg bg-teal text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                  >
                    <Send size={13} />
                    {bulkSending
                      ? "Sending..."
                      : `Send All (${matchedCount})`}
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}


      {isProcessor && (
        <div className="flex flex-wrap gap-3 items-bottom slip-controls">
          <label className="text-xs space-y-1 block max-w-xs">
            <span className="text-muted">
              Viewing payslips for
            </span>

            <select
              value={selectedId}
              onChange={(e) => setSelectedId(e.target.value)}
              className="w-full text-sm border rounded-lg px-3 py-2 outline-none bg-paper border-line"
            >
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.name}
                </option>
              ))}
            </select>
          </label>

          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border flex-1 min-w-[220px] card card-border">
            <Search size={15} color={C.inkSoft} />

            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by month or status"
              className="bg-transparent outline-none text-sm w-full text-ink"
            />
          </div>
        </div>
      )}

      {!isProcessor && (
        <p className="text-xs text-muted">
          Showing payslips for {currentEmployee?.name}.
        </p>
      )}

      <div className="rounded-xl border overflow-hidden card card-border">
        <table className="w-full text-sm">
          <thead>
            <tr
              style={{
                borderBottom: `1px solid ${C.line}`,
                backgroundColor: C.brassSoft,
              }}
            >
              <th className="text-left px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-brass font-mono">
                  Payslip
                </span>
              </th>

              <th className="text-right px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-brass font-mono">
                  Income
                </span>
              </th>

              <th className="text-left px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-brass font-mono">
                  Date Issued
                </span>
              </th>

              <th className="text-right px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-brass font-mono">
                  Tax
                </span>
              </th>

              <th className="text-right px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-brass font-mono">
                  Net Pay
                </span>
              </th>

              <th className="text-left px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-brass font-mono">
                  Status
                </span>
              </th>

              <th className="text-left px-4 py-2.5">
                <span className="text-[10px] uppercase tracking-wider text-brass font-mono">
                  Actions
                </span>
              </th>
            </tr>
          </thead>

          <tbody>
            {list.length === 0 && (
              <tr>
                <td
                  colSpan="7"
                  className="px-4 py-6 text-sm text-muted"
                >
                  No payslips on record.
                </td>
              </tr>
            )}

            {list.map((p) => (
              <PayslipCard
                key={p.id}
                p={p}
                employeeName={targetEmployee?.name || "Employee"}
                isProcessor={isProcessor}
                onSend={handleSend}
                sentPayslips={sentPayslips}
                payslipFileMap={payslipFileMap}
                searchQuery={search}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
