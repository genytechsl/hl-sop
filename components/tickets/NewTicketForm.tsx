"use client";

import { SetStateAction, useMemo, useState, useEffect } from "react";
import {
  Search,
  Bold,
  Italic,
  Underline,
  User,
  Mail,
  Phone,
  Building2,
  X,
  Upload,
  Paperclip,
  LoaderCircle,
  Save,
} from "lucide-react";
import { Customer } from "@/types/customer";
import Link from "next/link";
import Toast from "../BottomRIghtToast";

interface TicketCategory {
  id: number;
  code: string;
  label: string;
  sla: string;
  priority: string;
}

interface Department {
  id: number;
  name: string;
  head: string;
  email: string;
  description?: string | null;
}

interface TicketTypeScope {
  id: number;
  ticketType: string;
  scope: string;
}

interface Employee {
  id: string;
  name: string;
  designation: string;
  email: string;
  active: boolean;
  role: string;
  username: string;
  department: string;
}

// const getSlaTarget = (category: string) => {
//   switch (category) {
//     case "CAT-A":
//       return "24";

//     case "CAT-B":
//       return "7 Working Days";

//     case "CAT-B2":
//       return "7 Days";

//     case "CAT-C":
//       return "5 Working Days";

//     case "CAT-D":
//       return "10 Working Days";

//     default:
//       return "24";
//   }
// };

// const getPriority = (category: string) => {
//   switch (category) {
//     case "CAT-A":
//       return "VERY HIGH";

//     case "CAT-B":
//       return "HIGH";

//     case "CAT-B2":
//       return "MEDIUM";

//     case "CAT-C":
//       return "LOW";

//     case "CAT-D":
//       return "VERY LOW";

//     default:
//       return "MEDIUM";
//   }
// };

// const categoryOptions = [
//   {
//     code: "CAT-A",
//     label: "Critical",
//     sla: "24 h",
//     priority: "Very High",
//   },
//   {
//     code: "CAT-B",
//     label: "Technical",
//     sla: "7 wd",
//     priority: "High",
//   },
//   {
//     code: "CAT-B2",
//     label: "SFM Facility",
//     sla: "7 d",
//     priority: "Medium",
//   },
//   {
//     code: "CAT-C",
//     label: "Admin / Pay",
//     sla: "5 wd",
//     priority: "Low",
//   },
//   {
//     code: "CAT-D",
//     label: "Legal",
//     sla: "10 wd",
//     priority: "Very Low",
//   },
// ];

// const emailSuggestions = employees.filter((employee) => employee.active);

export default function NewTicketForm() {
  const [search, setSearch] = useState("");
  // const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
  //   null,
  // );
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(
    null,
  );
  const [selectedProperty, setSelectedProperty] = useState<{
    propertyName: string;
    address: string;
  } | null>(null);
  const [attachments, setAttachments] = useState<File[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [selectedEmails, setSelectedEmails] = useState<string[]>([]);
  const [ticketType, setTicketType] = useState<"COM" | "INQ">("INQ");

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [actionOwnerId, setActionOwnerId] = useState("");
  const [scope, setScope] = useState("");
  const [complaintSource, setComplaintSource] = useState("Customer Call");
  const [showConfirm, setShowConfirm] = useState(false);
  const [isSaving, setisSaving] = useState<boolean>(false);
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [department, setDepartment] = useState("");
  const [loadingDepartments, setLoadingDepartments] = useState(false);

  const [scopes, setScopes] = useState<TicketTypeScope[]>([]);
  const [loadingScopes, setLoadingScopes] = useState(false);

  const [categoryOptions, setCategoryOptions] = useState<TicketCategory[]>([]);

  const [loadingCategories, setLoadingCategories] = useState(false);
  const [category, setCategory] = useState("categoryOptions[0].code");

  useEffect(() => {
    async function loadDepartments() {
      try {
        setLoadingDepartments(true);

        const response = await fetch("/api/settings/departments");

        if (!response.ok) {
          throw new Error("Failed to load departments");
        }

        const data = await response.json();

        setDepartments(data);
      } catch (error) {
        console.error("Failed to load departments:", error);

        setDepartments([]);

        setToast({
          open: true,
          type: "error",
          title: "Failed",
          message: "Unable to load departments.",
        });
      } finally {
        setLoadingDepartments(false);
      }
    }

    loadDepartments();
  }, []);

  useEffect(() => {
    async function loadScopes() {
      if (!ticketType) {
        setScopes([]);
        setScope("");
        return;
      }

      try {
        setLoadingScopes(true);

        const response = await fetch(
          `/api/settings/ticket-type-scopes?ticketType=${encodeURIComponent(ticketType)}`,
        );

        if (!response.ok) {
          setToast({
            open: true,
            type: "error",
            title: "Failed",
            message: "Unable to load ticket scopes.",
          });
        }

        const data = await response.json();

        setScopes(data);

        // Clear current scope if it doesn't exist
        // under the newly selected ticket type.
        setScope((currentScope) => {
          const exists = data.some(
            (item: TicketTypeScope) => item.scope === currentScope,
          );

          return exists ? currentScope : "";
        });
      } catch (error) {
        console.error("Failed to load scopes:", error);

        setScopes([]);
        setScope("");

        setToast({
          open: true,
          type: "error",
          title: "Failed",
          message: "Unable to load ticket scopes.",
        });
      } finally {
        setLoadingScopes(false);
      }
    }

    loadScopes();
  }, [ticketType]);

  useEffect(() => {
    async function loadCategories() {
      try {
        setLoadingCategories(true);

        const response = await fetch("/api/settings/ticket-type-categories");

        if (!response.ok) {
          setToast({
            open: true,
            type: "error",
            title: "Failed",
            message: "Unable to load ticket categories.",
          });
        }

        const data = await response.json();

        setCategoryOptions(data);
      } catch (error) {
        console.error("Failed to load categories:", error);

        setToast({
          open: true,
          type: "error",
          title: "Failed",
          message: "Unable to load ticket categories.",
        });
      } finally {
        setLoadingCategories(false);
      }
    }

    loadCategories();
  }, []);

  const getSlaTarget = (categoryCode: string) => {
    const selected = categoryOptions.find((item) => item.code === categoryCode);

    return selected?.sla || "";
  };

  const [dialog, setDialog] = useState<{
    open: boolean;
    type: "success" | "error" | "warning";
    title: string;
    message: string;
  }>({
    open: false,
    type: "success",
    title: "",
    message: "",
  });

  const [newTicketToast, setNewTicketToast] = useState<{
    open: boolean;
    ticketId: string;
  }>({
    open: false,
    ticketId: "",
  });

  const [toast, setToast] = useState({
    open: false,
    type: "success" as "success" | "error" | "warning" | "info",
    title: "",
    message: "",
  });

  useEffect(() => {
    if (!toast.open) return;

    const timer = setTimeout(() => {
      setToast((prev) => ({
        ...prev,
        open: false,
      }));
    }, 10000);

    return () => clearTimeout(timer);
  }, [toast.open]);

  const [showEmailConfirm, setShowEmailConfirm] = useState(false);

  const selectedCategory = useMemo(
    () => categoryOptions.find((c) => c.code === category),
    [category],
  );

  useEffect(() => {
    async function loadCustomers() {
      const response = await fetch("/api/customers");

      const data = await response.json();

      setCustomers(data);
    }

    loadCustomers();
  }, []);

  const filteredCustomers = customers.filter(
    (customer) =>
      customer.name.toLowerCase().includes(search.toLowerCase()) ||
      customer.NIC.toLowerCase().includes(search.toLowerCase()) ||
      customer.email.toLowerCase().includes(search) ||
      customer.mobile.includes(search),
  );

  useEffect(() => {
    async function searchCustomers() {
      const response = await fetch(`/api/customers?search=${search}`);

      const data = await response.json();

      setCustomers(data);
    }

    searchCustomers();
  }, [search]);

  const categoryRoleMap: Record<string, string[]> = {
    "CAT-A": ["MEP Engineer"],
    "CAT-B": ["MEP Engineer", "Contractor"],
    "CAT-B2": ["SFM Department"],
    "CAT-C": ["CMU Manager"],
    "CAT-D": ["Operations Executive"],
  };

  const ALLOWED_FILE_TYPES = new Set([
    "application/pdf",
    "image/jpeg",
    "image/png",
    "image/webp",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/vnd.ms-outlook",
    "application/octet-stream",
  ]);

  const ALLOWED_FILE_EXTENSIONS = new Set([
    ".pdf",
    ".jpg",
    ".jpeg",
    ".png",
    ".webp",
    ".docx",
    ".xlsx",
    ".msg",
  ]);

  useEffect(() => {
    async function loadEmployees() {
      try {
        const response = await fetch("/api/users?active=true");

        if (!response.ok) {
          throw new Error("Failed to load employees");
        }

        const data = await response.json();

        setEmployees(data);
      } catch (error) {
        console.error("Failed to load employees:", error);

        setToast({
          open: true,
          type: "error",
          title: "Failed",
          message: "Unable to load action owners.",
        });
      }
    }

    loadEmployees();
  }, []);

  const availableEmployees = useMemo(() => {
    const allowedRoles = categoryRoleMap[category] || [];

    return employees.filter((employee) => {
      const matchesCategory = allowedRoles.includes(employee.designation);

      const matchesDepartment =
        !department || employee.department === department;

      return employee.active && matchesCategory && matchesDepartment;
    });
  }, [category, department, employees]);

  const emailSuggestions = useMemo(() => {
    return employees.filter((employee) => employee.active);
  }, [employees]);

  const selectedActionOwner = useMemo(() => {
    return employees.find((employee) => employee.id === actionOwnerId);
  }, [actionOwnerId]);

  const addFiles = (newFiles: File[]) => {
    const invalidFiles: string[] = [];

    const validFiles = newFiles.filter((file) => {
      const extension = file.name
        .substring(file.name.lastIndexOf("."))
        .toLowerCase();

      const validMimeType = ALLOWED_FILE_TYPES.has(file.type);
      const validExtension = ALLOWED_FILE_EXTENSIONS.has(extension);

      // Accept if either the MIME type OR extension is valid.
      const isValid = validMimeType || validExtension;

      if (!isValid) {
        invalidFiles.push(file.name);
      }

      return isValid;
    });

    if (invalidFiles.length > 0) {
      setToast({
        open: true,
        type: "warning",
        title: "Unsupported File Type",
        message: `The following file${
          invalidFiles.length > 1 ? "s" : ""
        } cannot be attached: ${invalidFiles.join(", ")}`,
      });
    }

    setAttachments((prev) => {
      const existing = new Set(
        prev.map((f) => `${f.name}-${f.size}-${f.lastModified}`),
      );

      const uniqueFiles = validFiles.filter(
        (f) => !existing.has(`${f.name}-${f.size}-${f.lastModified}`),
      );

      return [...prev, ...uniqueFiles];
    });
  };

  // attachment upload logic start
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || files.length === 0) return;

    // setAttachments((prev) => [...prev, ...Array.from(files)]);
    addFiles(Array.from(files));

    // allows selecting same file again later
    e.target.value = "";
  };

  const removeAttachment = (indexToRemove: number) => {
    setAttachments((prev) =>
      prev.filter((_, index) => index !== indexToRemove),
    );
  };

  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
  };

  const handleDragEnter = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();

    // prevent flickering
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setDragActive(false);

    const files = e.dataTransfer.files;

    if (!files || files.length === 0) return;

    // setAttachments((prev) => [...prev, ...Array.from(files)]);
    addFiles(Array.from(files));
  };
  // attachment upload logic end

  const addEmail = (email: string) => {
    if (!selectedEmails.includes(email)) {
      setSelectedEmails((prev) => [...prev, email]);
    }

    setEmailInput("");
  };

  const removeEmail = (email: string) => {
    setSelectedEmails((prev) => prev.filter((x) => x !== email));
  };

  const openSubmitConfirmation = () => {
    if (!selectedCustomer) {
      setToast({
        open: true,
        type: "warning",
        title: "Missing Information",
        message: "Please select a customer before creating the ticket.",
      });
      return;
    }

    if (!actionOwnerId) {
      setToast({
        open: true,
        type: "warning",
        title: "Missing Information",
        message: "Please assign a user to the ticket.",
      });
      return;
    }

    if (!title.trim()) {
      setToast({
        open: true,
        type: "warning",
        title: "Missing Information",
        message: "Please enter a title for the ticket.",
      });
      return;
    }
    setShowEmailConfirm(true);
  };

  const handleSubmit = async (sendEmail: boolean) => {
    try {
      setisSaving(true);
      const newTicket = {
        title,
        description,
        ticketType,
        category,
        categoryLabel: selectedCategory?.label.toUpperCase() || "",
        property: selectedProperty,
        status: "OPEN",
        // priority: getPriority(category),
        priority: "",
        assignedToId: selectedActionOwner?.id || "",
        // createdAt: new Date().toISOString().replace("T", " ").slice(0, 16),
        customerName: selectedCustomer?.name,
        slaTarget: getSlaTarget(category),
        complaintSource,
        scope,
        cctoList: selectedEmails,
        customerEmail: selectedCustomer?.email[0],
        actionOwnerEmail: selectedActionOwner?.email,
        actionOwnerName: selectedActionOwner?.name,
      };

      // const sendEmail = window.confirm(`Send email notification to customer?`);
      // setShowEmailConfirm(true);

      const ticketEmail = { ...newTicket, sendEmail };

      const response = await fetch("/api/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ticketEmail),
      });

      const result_newTicketCreated = await response.json();

      if (!response.ok) {
        setToast({
          open: true,
          type: "error",
          title: "Failed!",
          message: `Failed to open a new ticket. ${result_newTicketCreated.message}.`,
        });

        return;
      }

      // Upload attachments after ticket creation
      if (attachments.length > 0) {
        const formData = new FormData();

        attachments.forEach((file) => {
          formData.append("files", file);
        });

        const attachmentResponse = await fetch(
          `/api/tickets/${result_newTicketCreated.ticketId}/attachments`,
          {
            method: "POST",
            body: formData,
          },
        );

        const attachmentResult = await attachmentResponse.json();

        if (!attachmentResponse.ok) {
          console.error("Attachment upload failed:", attachmentResult);

          setToast({
            open: true,
            type: "warning",
            title: "Ticket Created",
            message:
              "The ticket was created, but one or more attachments could not be uploaded.",
          });
        }
      }

      const response_remark = await fetch("/api/remarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId: result_newTicketCreated.ticketId,
          remarkType: "New Ticket Open",
          statusChangedTo: "OPEN",
        }),
      });

      if (result_newTicketCreated.emailSent) {
        setNewTicketToast({
          open: true,
          ticketId: result_newTicketCreated.ticketId,
        });
        setTitle("");
        setDescription("");
        setAttachments([]);
        setSelectedEmails([]);
        setSearch("");
        setSelectedCustomer(null);
        setComplaintSource("Customer Call");
      } else {
        setNewTicketToast({
          open: true,
          ticketId: result_newTicketCreated.ticketId,
        });
        setTitle("");
        setDescription("");
        setAttachments([]);
        setSelectedEmails([]);
        setSearch("");
        setSelectedCustomer(null);
        setComplaintSource("Customer Call");
      }
    } catch (error) {
      setToast({
        open: true,
        type: "error",
        title: "Failed!",
        message:
          "Something went wrong while creating the ticket. Please try again.",
      });
    } finally {
      setisSaving(false);
    }
  };

  useEffect(() => {
    if (!newTicketToast.open) return;

    const timer = setTimeout(() => {
      setNewTicketToast({
        open: false,
        ticketId: "",
      });
    }, 7000);

    return () => clearTimeout(timer);
  }, [newTicketToast.open]);
  if (isSaving) {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        <div
          className="
        absolute inset-0 z-50
        flex flex-col items-center justify-center
        bg-white/80 backdrop-blur-[2px]
      "
        >
          <LoaderCircle size={42} className="animate-spin text-blue-600" />

          <p className="mt-4 text-base font-medium text-slate-700">
            Saving ticket...
          </p>

          <p className="mt-1 text-sm text-slate-500">
            Please wait while we create the ticket.
          </p>
        </div>
      </section>
    );
  } else {
    return (
      <section className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Top Accent */}

        {/* <div className="h-1.5 bg-blue-600" /> */}

        <div className="p-6 lg:p-8 space-y-10">
          {/* TICKET DETAILS - ROW 1*/}

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              1. Ticket Details
            </h2>

            <div className="mt-6 space-y-5">
              {/* Row 1 */}

              <div className="grid md:grid-cols-4 gap-4">
                {/* complaint or inquiry */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Type
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      onClick={() => setTicketType("INQ")}
                      className={`group rounded-xl border px-4 py-1 text-left transition-all duration-200 ${
                        ticketType === "INQ"
                          ? "border-blue-500 bg-blue-50 shadow-sm ring-2 ring-blue-100"
                          : "border-gray-200 bg-white hover:border-blue-300 hover:bg-blue-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`font-semibold ${
                              ticketType === "INQ"
                                ? "text-blue-700"
                                : "text-gray-800"
                            }`}
                          >
                            Inquiry
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Request information or clarification
                          </p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            ticketType === "INQ"
                              ? "border-blue-500"
                              : "border-gray-300 group-hover:border-blue-400"
                          }`}
                        >
                          {ticketType === "INQ" && (
                            <div className="h-2.5 w-2.5 rounded-full bg-blue-500" />
                          )}
                        </div>
                      </div>
                    </button>

                    <button
                      type="button"
                      onClick={() => setTicketType("COM")}
                      className={`group rounded-xl border px-4 py-1 text-left transition-all duration-200 ${
                        ticketType === "COM"
                          ? "border-red-500 bg-red-50 shadow-sm ring-2 ring-red-100"
                          : "border-gray-200 bg-white hover:border-red-300 hover:bg-red-50/40"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p
                            className={`font-semibold ${
                              ticketType === "COM"
                                ? "text-red-700"
                                : "text-gray-800"
                            }`}
                          >
                            Complaint
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            Report an issue requiring action
                          </p>
                        </div>

                        <div
                          className={`h-5 w-5 rounded-full border-2 flex items-center justify-center transition-all ${
                            ticketType === "COM"
                              ? "border-red-500"
                              : "border-gray-300 group-hover:border-red-400"
                          }`}
                        >
                          {ticketType === "COM" && (
                            <div className="h-2.5 w-2.5 rounded-full bg-red-500" />
                          )}
                        </div>
                      </div>
                    </button>
                  </div>
                </div>
                {/* Category name */}
                <SelectField
                  label="Category Code"
                  value={category}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setCategory(e.target.value)}
                >
                  <option value="">
                    {loadingCategories
                      ? "Loading categories..."
                      : "Select Category"}
                  </option>

                  {categoryOptions.map((item) => (
                    <option key={item.code} value={item.code}>
                      {item.code} ({item.label})
                    </option>
                  ))}
                </SelectField>
                {/* category code */}
                <InputField
                  label="SLA"
                  value={selectedCategory?.sla ?? ""}
                  readOnly
                />
              </div>

              {/* Row 2 */}

              <div className="grid md:grid-cols-4 gap-4">
                <div className="md:col-span-1">
                  <SelectField
                    label="Department"
                    value={department}
                    onChange={(e: React.ChangeEvent<HTMLSelectElement>) => {
                      setDepartment(e.target.value);

                      // Clear selected action owner when department changes
                      setActionOwnerId("");
                    }}
                  >
                    <option value="">
                      {loadingDepartments
                        ? "Loading departments..."
                        : "Select Department"}
                    </option>

                    {departments.map((item) => (
                      <option key={item.id} value={item.name}>
                        {item.name}
                      </option>
                    ))}
                  </SelectField>
                </div>
                {/* Action Owner */}
                <div className="md:col-span-1">
                  <div className="col-span-2">
                    <SelectField
                      label="Action Owner"
                      value={actionOwnerId}
                      onChange={(e: any) => setActionOwnerId(e.target.value)}
                    >
                      <option value="">Select Action Owner</option>

                      {availableEmployees.map((employee) => (
                        <option key={employee.id} value={employee.id}>
                          {employee.designation} - {employee.name}
                        </option>
                      ))}
                    </SelectField>
                  </div>
                </div>
                {/* <InputField label="Scope *" placeholder="Required" /> */}

                <SelectField
                  label="Scope *"
                  value={scope}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setScope(e.target.value)}
                >
                  <option value="">
                    {loadingScopes ? "Loading scopes..." : "Select Scope"}
                  </option>

                  {scopes.map((item) => (
                    <option key={item.id} value={item.scope}>
                      {item.scope}
                    </option>
                  ))}
                </SelectField>

                <SelectField
                  label="Complaint Source"
                  value={complaintSource}
                  onChange={(e: {
                    target: { value: SetStateAction<string> };
                  }) => setComplaintSource(e.target.value)}
                >
                  <option value="Customer Call">Customer Call</option>
                  <option value="Email">Email</option>
                  <option value="Whatsapp">Whatsapp</option>
                </SelectField>

                {/* <InputField
                  label="Priority"
                  value={selectedCategory?.priority ?? ""}
                  readOnly
                /> */}
              </div>

              {/* Subject */}

              <InputField
                label="Subject / Short Title"
                placeholder="Enter ticket title"
                value={title}
                onChange={(e: any) => setTitle(e.target.value)}
              />

              {/* Description */}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Description / Details
                </label>

                <div className="border border-slate-300 rounded-t-2xl p-3 flex gap-2 bg-slate-50">
                  <button
                    type="button"
                    className="p-2 hover:bg-white rounded-lg"
                  >
                    <Bold size={16} />
                  </button>

                  <button
                    type="button"
                    className="p-2 hover:bg-white rounded-lg"
                  >
                    <Italic size={16} />
                  </button>

                  <button
                    type="button"
                    className="p-2 hover:bg-white rounded-lg"
                  >
                    <Underline size={16} />
                  </button>
                </div>

                <textarea
                  rows={5}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full rounded-b-2xl border border-t-0 border-slate-300 p-4 resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 overflow-y-auto"
                />
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* CUSTOMER - ROW 2*/}
          {/* ================================================= */}

          <div>
            <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-5">
              <div>
                <h2 className="text-xl font-bold text-slate-800">
                  2. Customer
                </h2>

                <p className="text-slate-500 mt-1">
                  Search existing customers by NIC, name, mobile or email.
                </p>
              </div>

              <Link href={"../settings/customers/new"}>
                <button type="button" className="geny-theme-button-border">
                  <User size={18} />
                  New Customer
                </button>
              </Link>
            </div>

            <div className="mt-5 relative">
              <Search
                size={18}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
              />

              <input
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);

                  if (selectedCustomer) {
                    setSelectedCustomer(null);
                  }
                }}
                placeholder="Search customer..."
                className="w-full
                          h-12
                          pl-12
                          pr-4
                          rounded-2xl
                          border
                          border-slate-300
                          focus:outline-none
                          focus:ring-2
                          focus:ring-blue-500
                        "
              />

              {search.length > 0 && !selectedCustomer && (
                <div
                  className="
                    absolute
                    top-full
                    left-0
                    right-0
                    mt-2
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-xl
                    z-20
                    max-h-64
                    overflow-y-auto
                  "
                >
                  {filteredCustomers.map((customer) => (
                    <button
                      key={customer.id}
                      type="button"
                      onClick={() => {
                        setSelectedCustomer(customer);
                        setSelectedProperty(null);
                        setSearch(customer.name);
                      }}
                      className="
                          w-full
                          text-left
                          px-4
                          py-3
                          hover:bg-slate-50
                        "
                    >
                      <div className="font-medium">{customer.name}</div>

                      <div className="text-xs text-slate-500">
                        {customer.mobile}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {selectedCustomer && (
              <div
                className="
                  mt-6
                  bg-slate-50
                  rounded-2xl
                  border
                  border-slate-200
                  overflow-hidden
                "
              >
                <div className="flex items-center justify-between px-5 py-3 border-b border-slate-200">
                  <h4 className="font-semibold text-slate-700">
                    Selected Customer
                  </h4>

                  <button
                    type="button"
                    onClick={() => {
                      setSelectedCustomer(null);
                      setSelectedProperty(null);
                      setSearch("");
                    }}
                    className="
                      h-8
                      w-8
                      rounded-lg
                      flex
                      items-center
                      justify-center
                      hover:bg-slate-200
                      transition
                    "
                  >
                    <X size={16} />
                  </button>
                </div>

                <div
                  className="
                  p-5
                  grid
                  md:grid-cols-2
                  gap-4
                  bg-blue-100/50
                "
                >
                  <InfoRow
                    icon={<User size={16} />}
                    label="Customer"
                    value={selectedCustomer.name}
                  />

                  <InfoRow
                    icon={<Mail size={16} />}
                    label="Email"
                    value={selectedCustomer.email}
                  />

                  <InfoRow
                    icon={<Phone size={16} />}
                    label="Mobile"
                    value={selectedCustomer.mobile}
                  />

                  {/* <InfoRow
                  icon={<Building2 size={16} />}
                  label="Property"
                  value={selectedCustomer.property}
                /> */}

                  <div className="flex gap-3">
                    <div className="text-blue-600 mt-1">
                      <Building2 size={16} />
                    </div>

                    <div className="flex-1">
                      <div className="text-xs text-slate-500 font-medium mb-1">
                        Property
                      </div>

                      <select
                        value={selectedProperty?.propertyName || ""}
                        onChange={(e) => {
                          const property = selectedCustomer.properties.find(
                            (item) => item.propertyName === e.target.value,
                          );

                          setSelectedProperty(property || null);
                        }}
                        className="
                            w-full
                            rounded-xl
                            border
                            border-slate-300
                            h-10
                            px-3
                            bg-white
                            text-sm
                            font-medium
                            text-slate-800
                            focus:outline-none
                            focus:ring-2
                            focus:ring-blue-500
                          "
                      >
                        <option value="">Select Property</option>

                        {selectedCustomer.properties.map((property) => (
                          <option
                            key={property.propertyName}
                            value={property.propertyName}
                          >
                            {property.propertyName}
                          </option>
                        ))}
                      </select>

                      {selectedProperty && (
                        <div className="text-xs text-slate-500 mt-2">
                          {selectedProperty.address}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* ================================================= */}
          {/* ATTACHMENTS - ROW 3*/}
          {/* ================================================= */}

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              3. Attachments (Optional)
            </h2>

            <div className="mt-6 grid lg:grid-cols-5 gap-6">
              {/* Upload Area */}

              <div className="lg:col-span-3">
                <label
                  htmlFor="attachment-upload"
                  onDragEnter={handleDragEnter}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                  className={`
                        flex
                        flex-col
                        items-center
                        justify-center
                        min-h-[250px]
                        border-2
                        border-dashed
                        rounded-3xl
                        cursor-pointer
                        transition-all
                        duration-300

                        ${
                          dragActive
                            ? "border-[#10b981] bg-blue-100 scale-[1.01]"
                            : "border-[#10b981] bg-blue-50/50 hover:border-[#14b8a6] hover:bg-[#14b8a611]"
                        }
                      `}
                >
                  <Upload
                    size={48}
                    className={`
                      mb-4 transition-all
                      ${dragActive ? "text-[#10b981]" : "text-[#10b981]"}
                    `}
                  />

                  <h4 className="font-semibold text-lg text-slate-800">
                    Drag & Drop Files Here
                  </h4>

                  <p className="text-slate-500 mt-2">or click to browse</p>

                  <p className="text-xs text-slate-400 mt-4">
                    PDF, Images, DOCX, XLSX
                  </p>

                  <input
                    id="attachment-upload"
                    type="file"
                    multiple
                    accept=".pdf,.jpg,.jpeg,.png,.webp,.docx,.xlsx,.msg,application/pdf,image/jpeg,image/png,image/webp,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-outlook"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* Attachment List */}

              <div className="lg:col-span-2">
                <div className="border border-slate-200 rounded-3xl h-full p-5 bg-slate-50">
                  <h4 className="font-semibold text-slate-800 mb-4">
                    Uploaded Files
                  </h4>

                  <div className="space-y-3 max-h-[250px] overflow-y-auto">
                    {attachments.length === 0 ? (
                      <p className="text-sm text-slate-500">
                        No attachments added.
                      </p>
                    ) : (
                      attachments.map((file, index) => (
                        <div
                          key={`${file.name}-${index}`}
                          className="
                            flex
                            items-center
                            justify-between
                            p-3
                            rounded-xl
                            bg-white
                            border
                            border-slate-200
                          "
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <Paperclip size={16} className="text-blue-600" />

                            <div className="truncate">
                              <p className="text-sm font-medium truncate">
                                {file.name}
                              </p>

                              <p className="text-xs text-slate-500">
                                {(file.size / 1024).toFixed(1)}
                                kb
                              </p>
                            </div>
                          </div>

                          <button
                            type="button"
                            onClick={() => removeAttachment(index)}
                            className="
                              h-8
                              w-8
                              rounded-lg
                              flex
                              items-center
                              justify-center
                              hover:bg-red-100
                              text-red-500
                            "
                          >
                            <X size={16} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ================================================= */}
          {/* CC List Selector - ROW 4*/}
          {/* ================================================= */}

          <div>
            <h2 className="text-xl font-bold text-slate-800">
              4. CC to / Notification Recipients
            </h2>

            <p className="text-slate-500 mt-1">
              Select users who should receive ticket updates.
            </p>

            <div className="mt-5 relative">
              <div
                className="
              min-h-[56px]
              rounded-2xl
              border
              border-slate-300
              p-3
              flex
              flex-wrap
              gap-2
              bg-white
                "
              >
                {selectedEmails.map((email) => (
                  <div
                    key={email}
                    className="
                    flex
                    items-center
                    gap-2
                    bg-blue-100
                    text-blue-700
                    px-3
                    py-1.5
                    rounded-full
                    text-sm
                  "
                  >
                    {email}

                    <button type="button" onClick={() => removeEmail(email)}>
                      <X size={14} />
                    </button>
                  </div>
                ))}

                <input
                  value={emailInput}
                  onChange={(e) => setEmailInput(e.target.value)}
                  placeholder="Search email recipients..."
                  className="
                  flex-1
                  min-w-[200px]
                  outline-none
                "
                />
              </div>

              {emailInput && (
                <div
                  className="
                    absolute
                    z-20
                    left-0
                    right-0
                    mt-2
                    bg-white
                    border
                    border-slate-200
                    rounded-2xl
                    shadow-xl
                    overflow-hidden
                    max-h-80
                    overflow-y-auto
                  "
                >
                  {emailSuggestions
                    .filter(
                      (employee) =>
                        employee.name
                          .toLowerCase()
                          .includes(emailInput.toLowerCase()) ||
                        employee.email
                          .toLowerCase()
                          .includes(emailInput.toLowerCase()),
                    )
                    .filter(
                      (employee) => !selectedEmails.includes(employee.email),
                    )
                    .map((employee) => (
                      <button
                        key={employee.id}
                        type="button"
                        onClick={() => addEmail(employee.email)}
                        className="
                          w-full
                          text-left
                          px-4
                          py-3
                          hover:bg-slate-50
                          border-b
                          border-slate-100
                        "
                      >
                        <div className="font-medium">
                          <span className="font-semibold text-black/80">
                            {employee.name}
                          </span>{" "}
                          <span className="text-xs text-slate-500">
                            {employee.designation}
                          </span>
                        </div>

                        <div className="text-xs text-blue-600">
                          {employee.email}
                        </div>
                      </button>
                    ))}
                </div>
              )}
            </div>
          </div>

          <div className="pt-8 mt-8 border-t border-slate-200">
            <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-between gap-4">
              {/* Left Side */}

              <button type="button" className="geny-theme-button-border">
                Cancel
              </button>

              {/* Right Side */}

              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                {/* <button type="button" className="geny-theme-button">
                  Save as Draft
                </button> */}

                {/* <button
                type="button"
                onClick={openSubmitConfirmation}
                className="button-heading-special"
              >
                Submit Ticket
              </button> */}
                <button
                  onClick={openSubmitConfirmation}
                  disabled={isSaving}
                  className="geny-theme-button"
                >
                  {isSaving ? (
                    <LoaderCircle size={16} className="animate-spin" />
                  ) : (
                    <Save size={16} />
                  )}

                  {isSaving ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>

        {dialog.open && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white shadow-2xl p-7 animate-in fade-in zoom-in duration-200">
              <div
                className={`mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full
        ${
          dialog.type === "success"
            ? "bg-emerald-100"
            : dialog.type === "error"
              ? "bg-red-100"
              : "bg-amber-100"
        }`}
              >
                {dialog.type === "success" && (
                  <svg
                    className="h-8 w-8 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}

                {dialog.type === "error" && (
                  <svg
                    className="h-8 w-8 text-red-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M6 18L18 6M6 6l12 12" />
                  </svg>
                )}

                {dialog.type === "warning" && (
                  <svg
                    className="h-8 w-8 text-amber-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2.5}
                    viewBox="0 0 24 24"
                  >
                    <path d="M12 9v4m0 4h.01" />
                    <path d="M10.29 3.86L1.82 18A2 2 0 003.53 21h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z" />
                  </svg>
                )}
              </div>

              <h3 className="text-xl font-bold text-center text-slate-800">
                {dialog.title}
              </h3>

              <p className="mt-3 text-center text-slate-500">
                {dialog.message}
              </p>

              <button
                onClick={() => setDialog((prev) => ({ ...prev, open: false }))}
                className="mt-7 w-full rounded-xl bg-blue-600 py-3 font-semibold text-white transition hover:bg-blue-700"
              >
                OK
              </button>
            </div>
          </div>
        )}

        {newTicketToast.open && (
          <div
            className="
      fixed
      bottom-6
      right-6
      w-[380px]
      rounded-2xl
      border
      border-green-200
      bg-blue-200
      shadow-2xl
      p-5
      z-[9999]
      animate-in
      slide-in-from-bottom-5
      fade-in
    "
          >
            <div className="flex items-start gap-4">
              <div
                className="
          h-12
          w-12
          rounded-full
          bg-green-100
          flex
          items-center
          justify-center
          shrink-0
        "
              >
                <svg
                  className="h-6 w-6 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>

              <div className="flex-1">
                <h3 className="font-semibold text-slate-800">
                  New Ticket Created
                </h3>

                <p className="mt-1 text-sm text-slate-500">
                  Ticket{" "}
                  <span className="font-semibold text-slate-700">
                    {newTicketToast.ticketId}
                  </span>{" "}
                  has been created successfully.
                </p>

                <div className="mt-4 flex gap-2">
                  <Link
                    href={`/tickets/view?id=${newTicketToast.ticketId}`}
                    className="
                      rounded-lg
                      bg-blue-600
                      px-4
                      py-2
                      text-sm
                      font-medium
                      text-white
                      hover:bg-blue-700
                    "
                  >
                    View Ticket
                  </Link>

                  <button
                    onClick={() =>
                      setNewTicketToast({
                        open: false,
                        ticketId: "",
                      })
                    }
                    className="
              rounded-lg
              border
              border-slate-200
              px-4
              py-2
              text-sm
              hover:bg-slate-50
            "
                  >
                    Dismiss
                  </button>
                </div>
              </div>

              <button
                onClick={() =>
                  setNewTicketToast({
                    open: false,
                    ticketId: "",
                  })
                }
                className="text-slate-400 hover:text-slate-700"
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <Toast
          open={toast.open}
          type={toast.type}
          title={toast.title}
          message={toast.message}
          // confirmButton="View Ticket"
          onClose={() =>
            setToast((prev) => ({
              ...prev,
              open: false,
            }))
          }
        />

        {showEmailConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
            <div className="w-full max-w-md rounded-3xl bg-white p-7 shadow-2xl">
              <h3 className="text-xl font-bold">Send Email Notification?</h3>

              <p className="mt-3 text-slate-500">
                Would you like to notify the customer and action owner via email
                after creating this ticket?
              </p>

              <div className="mt-7 flex gap-3">
                <button
                  className="flex-1 rounded-xl border py-3"
                  onClick={() => {
                    setShowEmailConfirm(false);
                    handleSubmit(true);
                  }}
                >
                  Send Email
                </button>

                <button
                  className="flex-1 rounded-xl bg-blue-600 py-3 text-white"
                  onClick={() => {
                    setShowEmailConfirm(false);
                    handleSubmit(false);
                  }}
                >
                  Skip
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    );
  }
}

function InputField(props: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-slate-700">
        {props.label}
      </label>

      <input
        {...props}
        className="
          w-full
          h-11
          px-4
          rounded-xl
          border
          border-slate-300
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      />
    </div>
  );
}

function SelectField({ label, children, ...props }: any) {
  return (
    <div>
      <label className="block text-sm font-medium mb-2 text-slate-700">
        {label}
      </label>

      <select
        {...props}
        className="
          w-full
          h-11
          px-4
          rounded-xl
          border
          border-slate-300
          focus:outline-none
          focus:ring-2
          focus:ring-blue-500
        "
      >
        {children}
      </select>
    </div>
  );
}

function InfoRow({ icon, label, value }: any) {
  return (
    <div className="flex gap-3">
      <div className="text-blue-600">{icon}</div>

      <div>
        <div className="text-xs text-slate-500">{label}</div>

        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}
