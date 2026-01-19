"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Plus, Pencil, Trash, GripVertical } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { ElementForm } from "./element-form";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

type HomePageElement = {
  id: string;
  sectionType: string;
  title: string | null;
  subtitle: string | null;
  content: any;
  order: number;
  isActive: boolean;
};

interface SortableRowProps {
  element: HomePageElement;
  onEdit: (element: HomePageElement) => void;
  onDelete: (id: string) => void;
}

const SortableRow = ({ element, onEdit, onDelete }: SortableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: element.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    zIndex: isDragging ? 2 : 1,
    position: isDragging ? "relative" as const : undefined,
  };

  return (
    <TableRow ref={setNodeRef} style={style} className={isDragging ? "bg-slate-100 opacity-80" : ""}>
      <TableCell>
        <div {...attributes} {...listeners} className="cursor-grab active:cursor-grabbing">
          <GripVertical className="h-4 w-4 text-slate-400" />
        </div>
      </TableCell>
      <TableCell className="font-medium">{element.sectionType}</TableCell>
      <TableCell>{element.title || "-"}</TableCell>
      <TableCell>
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
            element.isActive
              ? "bg-green-100 text-green-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {element.isActive ? "Active" : "Inactive"}
        </span>
      </TableCell>
      <TableCell className="text-right">
        <div className="flex justify-end gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => onEdit(element)}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-red-500 hover:text-red-600"
            onClick={() => onDelete(element.id)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        </div>
      </TableCell>
    </TableRow>
  );
};

export const HomePageClient = () => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedElement, setSelectedElement] = useState<HomePageElement | null>(null);
  const [items, setItems] = useState<HomePageElement[]>([]);

  const { data: elements, isLoading } = useQuery({
    queryKey: ["homepage-elements"],
    queryFn: async () => {
      const res = await fetch("/api/admin/homepage");
      if (!res.ok) throw new Error("Failed to fetch elements");
      return res.json() as Promise<HomePageElement[]>;
    },
  });

  useEffect(() => {
    if (elements) {
      setItems(elements);
    }
  }, [elements]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const reorderMutation = useMutation({
    mutationFn: async (newItems: { id: string; order: number }[]) => {
      const res = await fetch("/api/admin/homepage/reorder", {
        method: "PUT",
        body: JSON.stringify(newItems),
      });
      if (!res.ok) throw new Error("Failed to reorder elements");
    },
    onSuccess: () => {
      toast.success("Order updated successfully");
      queryClient.invalidateQueries({ queryKey: ["homepage-elements"] });
    },
    onError: () => {
      toast.error("Failed to update order");
    },
  });

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (over && active.id !== over.id) {
      setItems((items) => {
        const oldIndex = items.findIndex((item) => item.id === active.id);
        const newIndex = items.findIndex((item) => item.id === over.id);

        const newItems = arrayMove(items, oldIndex, newIndex);

        // Prepare payload for API
        const updates = newItems.map((item, index) => ({
          id: item.id,
          order: index,
        }));

        reorderMutation.mutate(updates);

        return newItems;
      });
    }
  };

  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`/api/admin/homepage/${id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete element");
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["homepage-elements"] });
      toast.success("Element deleted successfully");
    },
    onError: () => {
      toast.error("Failed to delete element");
    },
  });

  const handleEdit = (element: HomePageElement) => {
    setSelectedElement(element);
    setIsDialogOpen(true);
  };

  const handleCreate = () => {
    setSelectedElement(null);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    if (confirm("Are you sure you want to delete this element?")) {
      deleteMutation.mutate(id);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Homepage Management</h1>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" /> Add Element
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Homepage Elements</CardTitle>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[50px]"></TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <SortableContext
                  items={items.map((item) => item.id)}
                  strategy={verticalListSortingStrategy}
                >
                  {items.map((element) => (
                    <SortableRow
                      key={element.id}
                      element={element}
                      onEdit={handleEdit}
                      onDelete={handleDelete}
                    />
                  ))}
                </SortableContext>
                {items.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center text-slate-500">
                      No elements found. Add one to get started.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </DndContext>
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {selectedElement ? "Edit Element" : "Create Element"}
            </DialogTitle>
          </DialogHeader>
          <ElementForm
            initialData={selectedElement}
            onSuccess={() => {
              setIsDialogOpen(false);
              queryClient.invalidateQueries({ queryKey: ["homepage-elements"] });
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
};
