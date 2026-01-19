import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ArrowDown, ArrowUp, Plus, Trash } from "lucide-react";
import { Control, useFieldArray } from "react-hook-form";
import { ImageUpload } from "../image-upload";
import { VideoUpload } from "../video-upload";

export const EditItemsFields = ({ control }: { control: Control<any> }) => {
  const { fields, append, remove, move } = useFieldArray({
    control,
    name: "content.editItems",
  });

  return (
    <div className="space-y-4">
      <h4 className="text-sm font-medium">The Edit (Videos)</h4>
      {fields.map((field, index) => (
        <Card key={field.id}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Edit Item {index + 1}</CardTitle>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index - 1)}
                disabled={index === 0}
              >
                <ArrowUp className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => move(index, index + 1)}
                disabled={index === fields.length - 1}
              >
                <ArrowDown className="h-4 w-4" />
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="text-red-500"
                onClick={() => remove(index)}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={control}
              name={`content.editItems.${index}.video`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Video</FormLabel>
                  <FormControl>
                    <VideoUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={control}
                name={`content.editItems.${index}.title`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={control}
                name={`content.editItems.${index}.badge`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Badge</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={control}
              name={`content.editItems.${index}.description`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Nested Products for this Edit Item */}
            <EditItemProductsFields nestIndex={index} control={control} />
          </CardContent>
        </Card>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="mt-2"
        onClick={() => append({ id: Date.now(), title: "", video: "", badge: "", description: "", alt: "", products: [] })}
      >
        <Plus className="mr-2 h-4 w-4" /> Add Edit Item
      </Button>
    </div>
  );
};

const EditItemProductsFields = ({ nestIndex, control }: { nestIndex: number; control: Control<any> }) => {
  const { fields, append, remove } = useFieldArray({
    control,
    name: `content.editItems.${nestIndex}.products`,
  });

  return (
    <div className="space-y-2 border-t pt-4 mt-4">
      <h5 className="text-xs font-semibold uppercase tracking-wider text-slate-500">Products</h5>
      {fields.map((field, index) => (
        <div key={field.id} className="grid grid-cols-12 gap-2 items-end border p-2 rounded-md bg-slate-50/50">
          <div className="col-span-3">
            <FormField
              control={control}
              name={`content.editItems.${nestIndex}.products.${index}.image`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Image</FormLabel>
                  <FormControl>
                    <ImageUpload
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-4">
            <FormField
              control={control}
              name={`content.editItems.${nestIndex}.products.${index}.name`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Name</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-8 text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-3">
            <FormField
              control={control}
              name={`content.editItems.${nestIndex}.products.${index}.price`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-xs">Price</FormLabel>
                  <FormControl>
                    <Input {...field} className="h-8 text-xs" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="col-span-2 flex justify-end pb-1">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8 text-red-500"
              onClick={() => remove(index)}
            >
              <Trash className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
      <Button
        type="button"
        variant="ghost"
        size="sm"
        className="text-xs"
        onClick={() => append({ name: "", price: "", image: "" })}
      >
        <Plus className="mr-2 h-3 w-3" /> Add Product
      </Button>
    </div>
  );
};
