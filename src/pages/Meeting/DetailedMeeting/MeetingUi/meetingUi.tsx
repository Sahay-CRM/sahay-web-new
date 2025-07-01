import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ClipboardList,
  CalendarCheck,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface AgendaItem {
  id: string;
  text: string;
  type: "issue" | "suggestion";
}

export default function VerticalTabs() {
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [agendaItems, setAgendaItems] = useState<AgendaItem[]>([]);
  const [issueInput, setIssueInput] = useState("");
  const [suggestionInput, setSuggestionInput] = useState("");

  const addAgendaItem = (type: "issue" | "suggestion") => {
    const text = type === "issue" ? issueInput : suggestionInput;
    if (text.trim() === "") return;

    const newItem: AgendaItem = {
      id: Date.now().toString(),
      text,
      type,
    };

    setAgendaItems([...agendaItems, newItem]);
    if (type === "issue") {
      setIssueInput("");
    } else {
      setSuggestionInput("");
    }
  };

  const removeAgendaItem = (id: string) => {
    setAgendaItems(agendaItems.filter((item) => item.id !== id));
  };

  // Filter items by type
  const issues = agendaItems.filter((item) => item.type === "issue");
  const suggestions = agendaItems.filter((item) => item.type === "suggestion");

  return (
    <div className="flex h-full min-h-[500px] mt-5">
      <div
        className={`flex transition-all duration-300 ${isCollapsed ? "w-[50px]" : "w-[200px]"}`}
      >
        <Tabs
          orientation="vertical"
          defaultValue="agenda"
          className={`flex ${isCollapsed ? "flex-col items-center" : ""}`}
        >
          <div className="flex w-full">
            <div className="relative w-fit">
              <TabsList
                className={`flex ${isCollapsed ? "flex-col h-auto gap-2 p-2" : "flex-col h-auto gap-2 p-4 w-full"}`}
              >
                <TabsTrigger
                  value="agenda"
                  className={`justify-start text-left w-full ${isCollapsed ? "p-2" : "gap-2"}`}
                >
                  <ClipboardList className="h-4 w-4" />
                  {!isCollapsed && "Agenda"}
                </TabsTrigger>

                {/* Tasks with dropdown */}
                <div className="relative w-full">
                  <div
                    className={`flex items-center justify-between cursor-pointer ${isCollapsed ? "p-2" : "gap-2 p-2"}`}
                  >
                    <div className="flex items-center gap-2">
                      <CalendarCheck className="h-4 w-4" />
                      {!isCollapsed && "Description"}
                    </div>
                  </div>
                  {!isCollapsed && (
                    <div className="ml-6 mt-1 space-y-1">
                      <TabsTrigger
                        value="Tasks"
                        className="text-left w-full justify-start text-sm"
                      >
                        Tasks
                      </TabsTrigger>
                      <TabsTrigger
                        value="Project"
                        className="w-full justify-start text-left text-sm"
                      >
                        Project
                      </TabsTrigger>
                      <TabsTrigger
                        value="KPIs"
                        className="w-full justify-start text-sm"
                      >
                        KPIs
                      </TabsTrigger>
                    </div>
                  )}
                </div>

                <TabsTrigger
                  value="conclusion"
                  className={`justify-start text-left w-full ${isCollapsed ? "p-2" : "gap-2"}`}
                >
                  <CheckCircle className="h-4 w-4" />
                  {!isCollapsed && "Conclusion"}
                </TabsTrigger>
              </TabsList>
            </div>

            <Card className="ml-5 p-0 gap-2">
              <div>
                <Button
                  variant="ghost"
                  className={` ${isCollapsed ? "rotate-180" : ""}`}
                  onClick={() => setIsCollapsed(!isCollapsed)}
                >
                  {isCollapsed ? <ChevronRight /> : <ChevronLeft />}
                </Button>
              </div>
              <div className="flex-1 px-4 w-full min-w-5xl max-h-[500px] min-h-[500px] overflow-scroll">
                <TabsContent value="agenda" className="">
                  <div className="space-y-4">
                    <h3 className="font-semibold">Agenda</h3>

                    {/* Two-column layout */}
                    <div className="grid grid-cols-2 border rounded-lg">
                      {/* Issues Column */}
                      <div className="space-y-2 border-r pr-5 py-2 px-4">
                        <h4 className="font-medium">Issues</h4>
                        <div className="flex gap-2">
                          <Input
                            value={issueInput}
                            onChange={(e) => setIssueInput(e.target.value)}
                            placeholder="Enter an issue"
                          />
                          <Button onClick={() => addAgendaItem("issue")}>
                            Add
                          </Button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {issues.length > 0 ? (
                            <ul className="space-y-2">
                              {issues.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <span>{item.text}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAgendaItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No issues added
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Suggestions Column */}
                      <div className="space-y-2 py-2 px-4">
                        <h4 className="font-medium">Suggestions</h4>
                        <div className="flex gap-2">
                          <Input
                            value={suggestionInput}
                            onChange={(e) => setSuggestionInput(e.target.value)}
                            placeholder="Enter a suggestion"
                          />
                          <Button onClick={() => addAgendaItem("suggestion")}>
                            Add
                          </Button>
                        </div>
                        <div className="mt-2 space-y-2">
                          {suggestions.length > 0 ? (
                            <ul className="space-y-2">
                              {suggestions.map((item) => (
                                <li
                                  key={item.id}
                                  className="flex items-center justify-between p-2 border rounded"
                                >
                                  <span>{item.text}</span>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    onClick={() => removeAgendaItem(item.id)}
                                  >
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <p className="text-gray-500 text-sm">
                              No suggestions added
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                {/* Rest of the TabsContent components remain the same */}
                <TabsContent value="Tasks" className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Menu 1 Content</h3>
                    <p>This is the content for Menu 1</p>
                  </div>
                </TabsContent>

                <TabsContent value="Project" className="p-4 border rounded-lg">
                  <div className="space-y-2">
                    <h3 className="font-semibold">Menu 2 Content</h3>
                    <p>This is the content for Menu 2</p>
                  </div>
                </TabsContent>

                <TabsContent value="KPIs" className="p-4 border rounded-lg">
                  <div className="space-y-4">
                    <h3 className="font-semibold">KPIs (15 min)</h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              #
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Accounts
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Due Date
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Project Description
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {[2, 3, 4, 5, 6, 7, 8, 9].map((item) => (
                            <tr key={item}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {item}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Account {item}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                2025-{item}-{item * 2}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                Description {item}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent
                  value="conclusion"
                  className="p-4 border rounded-lg"
                >
                  <div className="space-y-2">
                    <h3 className="font-semibold">Conclusion (5 min)</h3>
                    <p>Summarize key points and action items</p>
                  </div>
                </TabsContent>
              </div>
            </Card>
          </div>
        </Tabs>
      </div>
    </div>
  );
}
