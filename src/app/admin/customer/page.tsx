import type { Metadata } from "next";
import { getInternalApiUrl } from "@/lib/internal-api";
import CustomerClient, { type CustomerResponse } from "./_components/customer-client";

export const metadata: Metadata = {
	title: "Admin • Customers",
	description: "Manage customer accounts, roles, and address preferences.",
};

export const dynamic = "force-dynamic";

async function getCustomers(): Promise<CustomerResponse[]> {
	try {
			const res = await fetch(getInternalApiUrl("/api/admin/customer"), {
			cache: "no-store",
			headers: { "Content-Type": "application/json" },
			credentials: "include",
		});

		if (!res.ok) {
			return [];
		}

		return res.json();
	} catch (error) {
		console.error("[ADMIN_CUSTOMERS_PAGE]", error);
		return [];
	}
}

const CustomerPage = async () => {
	const customers = await getCustomers();

	return (
		<div className="space-y-12">
			<section className="flex flex-col gap-8 rounded-[2.5rem] bg-white p-8 lg:p-12">
				<div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
					<div className="space-y-2">
						<p className="text-xs font-bold uppercase tracking-widest text-slate-500">Audience</p>
						<h1 className="text-4xl font-light text-slate-900 lg:text-5xl">Customers</h1>
						<p className="max-w-xl text-sm text-slate-500">
							Understand your buyers and fine-tune their experience.
						</p>
					</div>
				</div>
			</section>
			<CustomerClient initialCustomers={customers} />
		</div>
	);
};

export default CustomerPage;
