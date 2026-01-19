'use client';

import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface CancelOrderModalProps {
  orderId: string;
  trigger?: React.ReactNode;
}

export function CancelOrderModal({ orderId, trigger }: CancelOrderModalProps) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [accountDetails, setAccountDetails] = useState({
    accountHolderName: '',
    bankName: '',
    accountNumber: '',
    ifscCode: '',
  });

  const queryClient = useQueryClient();

  const { mutate: cancelOrder, isPending } = useMutation({
    mutationFn: async () => {
      const finalReason = reason === 'Other' ? otherReason : reason;

      const response = await fetch(`/api/storefront/orders/${orderId}/cancel`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          reason: finalReason,
          refundAccountDetails: accountDetails,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to cancel order');
      }

      return response.json();
    },
    onSuccess: () => {
      toast.success('Cancellation requested successfully');
      setOpen(false);
      queryClient.invalidateQueries({ queryKey: ['user-orders'] });
      queryClient.invalidateQueries({ queryKey: ['order', orderId] });
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason) {
      toast.error('Please select a reason for cancellation');
      return;
    }
    if (reason === 'Other' && !otherReason) {
      toast.error('Please specify the reason');
      return;
    }
    // Basic validation for account details
    if (!accountDetails.accountHolderName || !accountDetails.bankName || !accountDetails.accountNumber || !accountDetails.ifscCode) {
      toast.error('Please fill in all account details for refund');
      return;
    }

    cancelOrder();
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 border-rose-200">
            Cancel Order
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Cancel Order</DialogTitle>
          <DialogDescription>
            Please provide a reason for cancellation and your bank details for the refund.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-6 py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Cancellation</Label>
              <Select value={reason} onValueChange={setReason}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a reason" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Changed my mind">Changed my mind</SelectItem>
                  <SelectItem value="Found a better price">Found a better price</SelectItem>
                  <SelectItem value="Ordered by mistake">Ordered by mistake</SelectItem>
                  <SelectItem value="Shipping takes too long">Shipping takes too long</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {reason === 'Other' && (
              <div className="space-y-2">
                <Label htmlFor="otherReason">Please specify</Label>
                <Textarea
                  id="otherReason"
                  value={otherReason}
                  onChange={(e) => setOtherReason(e.target.value)}
                  placeholder="Tell us why you want to cancel..."
                />
              </div>
            )}

            <div className="space-y-4 rounded-lg border border-slate-100 bg-slate-50 p-4">
              <h4 className="text-sm font-medium text-slate-900">Refund Account Details</h4>

              <div className="space-y-2">
                <Label htmlFor="holderName">Account Holder Name</Label>
                <Input
                  id="holderName"
                  value={accountDetails.accountHolderName}
                  onChange={(e) => setAccountDetails({ ...accountDetails, accountHolderName: e.target.value })}
                  placeholder="e.g. John Doe"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="bankName">Bank Name</Label>
                <Input
                  id="bankName"
                  value={accountDetails.bankName}
                  onChange={(e) => setAccountDetails({ ...accountDetails, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="accountNumber">Account Number</Label>
                  <Input
                    id="accountNumber"
                    value={accountDetails.accountNumber}
                    onChange={(e) => setAccountDetails({ ...accountDetails, accountNumber: e.target.value })}
                    placeholder="Account Number"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="ifsc">IFSC Code</Label>
                  <Input
                    id="ifsc"
                    value={accountDetails.ifscCode}
                    onChange={(e) => setAccountDetails({ ...accountDetails, ifscCode: e.target.value })}
                    placeholder="IFSC Code"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setOpen(false)}>
              Keep Order
            </Button>
            <Button type="submit" variant="destructive" disabled={isPending}>
              {isPending ? 'Submitting...' : 'Confirm Cancellation'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
