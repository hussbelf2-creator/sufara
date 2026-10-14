/* Shared types for the supplier-contract workspace used by every dashboard role. */
export type ContractStatus = 'draft' | 'pending' | 'active' | 'rejected' | 'closed';

/* The lifecycle a supply contract walks through: it is drafted, reviewed by the
   factory, signed by both parties, supplied, then delivered. */
export type ContractStage = 'draft' | 'review' | 'signing' | 'supply' | 'delivery';

export const CONTRACT_STAGES: ContractStage[] = ['draft', 'review', 'signing', 'supply', 'delivery'];

/* Position of a stage inside the pipeline (0 = draft … 4 = delivery). */
export const stageIndex = (s: ContractStage): number => CONTRACT_STAGES.indexOf(s);

export type ContractSpec = { label: string; value: string };
export type ContractAttachment = { name: string; size: string };
export type ContractComment = {
  by: 'buyer' | 'factory' | 'admin';
  name: string;
  text: string;
  time: string;
};

export type Contract = {
  id: string;
  status: ContractStatus;
  stage: ContractStage;
  awaitingHours: number;
  signBuyer: boolean;
  signFactory: boolean;
  buyer: string;
  buyerCompany: string;
  buyerCountry: string;
  factory: string;
  factoryCity: string;
  product: string;
  quantity: string;
  unitPrice: string;
  total: string;
  currency: string;
  payment: string;
  incoterm: string;
  port: string;
  leadDays: string;
  deliveryDate: string;
  createdAt: string;
  updatedAt: string;
  specs: ContractSpec[];
  clauses: string[];
  images: string[];
  attachments: ContractAttachment[];
  comments: ContractComment[];
};

export type ContractRole = 'buyer' | 'factory' | 'admin';

/* Maps a contract status to the dashboard pill tone. */
export const statusTone = (s: ContractStatus): string => {
  switch (s) {
    case 'active':
      return 'ok';
    case 'pending':
      return 'warn';
    case 'rejected':
      return 'danger';
    case 'closed':
      return 'info';
    default:
      return 'mute';
  }
};

/* Deep-clones a contract so edits never mutate the shared mock objects. */
export const cloneContract = (c: Contract): Contract => ({
  ...c,
  specs: c.specs.map((s) => ({ ...s })),
  clauses: [...c.clauses],
  images: [...c.images],
  attachments: c.attachments.map((a) => ({ ...a })),
  comments: c.comments.map((m) => ({ ...m })),
});