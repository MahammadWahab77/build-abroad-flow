import type {
  DocumentData,
  LeadData,
  RemarkData,
  StageHistoryData,
  TaskData,
  UniversityAppData,
} from '@/types/lead';

interface MockTask extends TaskData {
  id: number;
  userId: number;
  userName: string;
  createdAt: string;
}

type MockLead = LeadData;

interface MockRemark extends RemarkData {
  id: number;
}

interface MockHistory extends StageHistoryData {
  id: number;
}

interface MockUniversityApp extends UniversityAppData {
  id: number;
}

type MockDocument = DocumentData;

interface MockRequestOptions {
  method: string;
  jsonBody?: unknown;
  rawBody?: BodyInit | null | undefined;
}

interface MockResult<T> {
  handled: boolean;
  data?: T;
}

const nextId = {
  task: 3,
  remark: 3,
  history: 3,
  university: 3,
  document: 3,
};

const mockDb = {
  leads: new Map<number, MockLead>(),
  tasks: new Map<number, MockTask[]>(),
  history: new Map<number, MockHistory[]>(),
  remarks: new Map<number, MockRemark[]>(),
  universities: new Map<number, MockUniversityApp[]>(),
  documents: new Map<number, MockDocument[]>(),
};

initializeMockDb();

function initializeMockDb() {
  if (mockDb.leads.size > 0) {
    return;
  }

  const initialLeads: MockLead[] = [
    {
      id: 1,
      uid: 'LD-001',
      name: 'Aarav Sharma',
      email: 'aarav.sharma@example.com',
      phone: '+91 9876543210',
      country: 'USA',
      course: 'MS Computer Science',
      intake: 'Fall 2025',
      source: 'Website',
      passportStatus: 'Submitted',
      currentStage: 'Application in Progress',
      counselorName: 'Priya Nair',
      createdAt: '2024-05-20T10:00:00.000Z',
    },
    {
      id: 2,
      uid: 'LD-002',
      name: 'Meera Iyer',
      email: 'meera.iyer@example.com',
      phone: '+91 9123456780',
      country: 'Canada',
      course: 'MBA',
      intake: 'Winter 2025',
      source: 'Referral',
      passportStatus: 'In Progress',
      currentStage: 'Shortlisted Univ.',
      counselorName: 'Rahul Verma',
      createdAt: '2024-05-18T08:30:00.000Z',
    },
  ];

  initialLeads.forEach((lead) => {
    mockDb.leads.set(lead.id, { ...lead });
  });

  mockDb.tasks.set(1, [
    {
      id: 1,
      taskType: 'Call',
      callType: 'Intro Call',
      connectStatus: 'Interested',
      remarks: 'Discussed goals and preferred destinations.',
      userId: 1,
      userName: 'Dev Admin',
      createdAt: '2024-05-21T09:30:00.000Z',
    },
    {
      id: 2,
      taskType: 'Shortlisting',
      shortlistingStatus: 'In Progress',
      remarks: 'Shared shortlist of 3 universities with the student.',
      universityName: 'Stanford University',
      universityUrl: 'https://apply.stanford.edu',
      userId: 1,
      userName: 'Dev Admin',
      createdAt: '2024-05-25T11:15:00.000Z',
    },
  ]);

  mockDb.tasks.set(2, [
    {
      id: 3,
      taskType: 'Call',
      callType: 'Session Reminder Call',
      connectStatus: 'Call Back',
      remarks: 'Left a voicemail to confirm counselling session.',
      userId: 2,
      userName: 'Support User',
      createdAt: '2024-05-22T07:45:00.000Z',
    },
  ]);

  nextId.task = 4;

  mockDb.history.set(1, [
    {
      id: 1,
      fromStage: 'Yet to Contact',
      toStage: 'Contact Again',
      userId: 1,
      userName: 'Dev Admin',
      reason: 'Introductory call completed successfully.',
      createdAt: '2024-05-21T10:00:00.000Z',
    },
    {
      id: 2,
      fromStage: 'Contact Again',
      toStage: 'Application in Progress',
      userId: 1,
      userName: 'Dev Admin',
      reason: 'All documents submitted, moving ahead with applications.',
      createdAt: '2024-05-28T15:30:00.000Z',
    },
  ]);

  mockDb.history.set(2, [
    {
      id: 3,
      fromStage: 'Yet to Decide',
      toStage: 'Shortlisted Univ.',
      userId: 2,
      userName: 'Support User',
      reason: 'Shared shortlist and student confirmed interest.',
      createdAt: '2024-05-19T12:05:00.000Z',
    },
  ]);

  nextId.history = 4;

  mockDb.remarks.set(1, [
    {
      id: 1,
      content: 'Student prefers universities with strong AI research.',
      userId: 1,
      userName: 'Dev Admin',
      createdAt: '2024-05-21T13:00:00.000Z',
    },
    {
      id: 2,
      content: 'Awaiting financial documents from the student.',
      userId: 1,
      userName: 'Dev Admin',
      createdAt: '2024-05-26T09:20:00.000Z',
    },
  ]);

  mockDb.remarks.set(2, [
    {
      id: 3,
      content: 'Student is considering MBA programs with co-op options.',
      userId: 2,
      userName: 'Support User',
      createdAt: '2024-05-20T10:45:00.000Z',
    },
  ]);

  nextId.remark = 4;

  mockDb.universities.set(1, [
    {
      id: 1,
      universityName: 'Stanford University',
      universityUrl: 'https://gradadmissions.stanford.edu',
      status: 'In Progress',
      createdAt: '2024-06-01T08:00:00.000Z',
    },
    {
      id: 2,
      universityName: 'MIT',
      universityUrl: 'https://gradapply.mit.edu',
      status: 'Pending Credentials',
      createdAt: '2024-06-03T11:30:00.000Z',
    },
  ]);

  mockDb.universities.set(2, [
    {
      id: 3,
      universityName: 'University of Toronto',
      universityUrl: 'https://future.utoronto.ca',
      status: 'Researching',
      createdAt: '2024-05-22T14:10:00.000Z',
    },
  ]);

  nextId.university = 4;

  mockDb.documents.set(1, [
    {
      id: 1,
      leadId: 1,
      documentType: 'Passport with Address page / Main page',
      documentUrl: 'https://files.example.com/passport-aarav.pdf',
      remarks: 'Uploaded by student on 22 May.',
      createdAt: '2024-05-22T12:00:00.000Z',
      updatedAt: '2024-05-22T12:00:00.000Z',
    },
    {
      id: 2,
      leadId: 1,
      documentType: 'Updated CV - (Europass CV) format',
      documentUrl: 'https://files.example.com/cv-aarav.pdf',
      remarks: 'Reviewed by counselor.',
      createdAt: '2024-05-24T16:45:00.000Z',
      updatedAt: '2024-05-24T16:45:00.000Z',
    },
  ]);

  mockDb.documents.set(2, [
    {
      id: 3,
      leadId: 2,
      documentType: 'Degree Certificate / Provisional degree',
      documentUrl: 'https://files.example.com/degree-meera.pdf',
      remarks: 'Needs notarized copy.',
      createdAt: '2024-05-20T11:25:00.000Z',
      updatedAt: '2024-05-20T11:25:00.000Z',
    },
  ]);

  nextId.document = 4;
}

export async function mockApiRequest<T>(path: string, options: MockRequestOptions): Promise<MockResult<T>> {
  if (!import.meta.env.DEV) {
    return { handled: false };
  }

  const pathname = normalizePath(path);
  if (!pathname.startsWith('/api')) {
    return { handled: false };
  }

  const method = options.method.toUpperCase();
  const payload = parseBody(options);

  const leadDetailMatch = pathname.match(/^\/api\/leads\/(\d+)$/);
  if (leadDetailMatch) {
    const leadId = Number(leadDetailMatch[1]);
    const lead = ensureLead(leadId);

    if (method === 'GET') {
      return { handled: true, data: clone(lead) as T };
    }

    if (method === 'PUT' && payload && typeof payload === 'object') {
      Object.assign(lead, payload as Record<string, unknown>);
      return { handled: true, data: clone(lead) as T };
    }

    return { handled: true, data: clone(lead) as T };
  }

  const tasksMatch = pathname.match(/^\/api\/leads\/(\d+)\/tasks$/);
  if (tasksMatch) {
    const leadId = Number(tasksMatch[1]);
    ensureLead(leadId);
    const tasks = getCollection(mockDb.tasks, leadId);

    if (method === 'GET') {
      return { handled: true, data: clone(tasks) as T };
    }

    if (method === 'POST') {
      const userName = typeof payload?.userName === 'string' && payload.userName ? payload.userName : 'Dev Admin';
      const userId = typeof payload?.userId === 'number' ? payload.userId : 1;
      const newTask: MockTask = {
        id: nextId.task++,
        createdAt: new Date().toISOString(),
        userName,
        userId,
        ...(payload as TaskData),
      };
      tasks.push(newTask);
      return { handled: true, data: clone(newTask) as T };
    }
  }

  const stageMatch = pathname.match(/^\/api\/leads\/(\d+)\/stage$/);
  if (stageMatch && method === 'PUT') {
    const leadId = Number(stageMatch[1]);
    const lead = ensureLead(leadId);
    const previousStage = lead.currentStage;
    const nextStage = typeof payload?.stage === 'string' ? payload.stage : previousStage;
    const userId = typeof payload?.userId === 'number' ? payload.userId : 1;
    const userName = typeof payload?.userName === 'string' && payload.userName ? payload.userName : 'Dev Admin';
    const reason = typeof payload?.reason === 'string' ? payload.reason : '';

    if (nextStage !== previousStage) {
      lead.currentStage = nextStage;
      const history = getCollection(mockDb.history, leadId);
      history.unshift({
        id: nextId.history++,
        fromStage: previousStage,
        toStage: nextStage,
        userId,
        userName,
        reason,
        createdAt: new Date().toISOString(),
      });
    }

    return { handled: true, data: clone({ success: true, currentStage: lead.currentStage }) as T };
  }

  const historyMatch = pathname.match(/^\/api\/leads\/(\d+)\/history$/);
  if (historyMatch && method === 'GET') {
    const leadId = Number(historyMatch[1]);
    ensureLead(leadId);
    const history = getCollection(mockDb.history, leadId);
    return { handled: true, data: clone(history) as T };
  }

  const remarksMatch = pathname.match(/^\/api\/leads\/(\d+)\/remarks$/);
  if (remarksMatch) {
    const leadId = Number(remarksMatch[1]);
    ensureLead(leadId);
    const remarks = getCollection(mockDb.remarks, leadId);

    if (method === 'GET') {
      return { handled: true, data: clone(remarks) as T };
    }

    if (method === 'POST') {
      const userId = typeof payload?.userId === 'number' ? payload.userId : 1;
      const userName = typeof payload?.userName === 'string' && payload.userName ? payload.userName : 'Dev Admin';
      const content = typeof payload?.content === 'string' ? payload.content : '';
      const newRemark: MockRemark = {
        id: nextId.remark++,
        content,
        userId,
        userName,
        createdAt: new Date().toISOString(),
      };
      remarks.unshift(newRemark);
      return { handled: true, data: clone(newRemark) as T };
    }
  }

  const universitiesMatch = pathname.match(/^\/api\/leads\/(\d+)\/universities$/);
  if (universitiesMatch) {
    const leadId = Number(universitiesMatch[1]);
    ensureLead(leadId);
    const universities = getCollection(mockDb.universities, leadId);

    if (method === 'GET') {
      return { handled: true, data: clone(universities) as T };
    }

    if (method === 'POST') {
      const newApp: MockUniversityApp = {
        id: nextId.university++,
        universityName: typeof payload?.universityName === 'string' ? payload.universityName : 'Unknown University',
        universityUrl: typeof payload?.universityUrl === 'string' ? payload.universityUrl : undefined,
        username: typeof payload?.username === 'string' ? payload.username : undefined,
        password: typeof payload?.password === 'string' ? payload.password : undefined,
        status: typeof payload?.status === 'string' ? payload.status : 'In Progress',
        createdAt: new Date().toISOString(),
      };
      universities.push(newApp);
      return { handled: true, data: clone(newApp) as T };
    }
  }

  const documentsMatch = pathname.match(/^\/api\/documents\/(\d+)$/);
  if (documentsMatch) {
    if (method === 'GET') {
      const leadId = Number(documentsMatch[1]);
      ensureLead(leadId);
      const documents = getCollection(mockDb.documents, leadId);
      return { handled: true, data: clone(documents) as T };
    }

    if (method === 'PATCH') {
      const documentId = Number(documentsMatch[1]);
      const target = findDocument(documentId);
      if (!target) {
        throw new Error('Document not found');
      }
      const { document } = target;
      if (typeof payload?.documentUrl === 'string') {
        document.documentUrl = payload.documentUrl;
      }
      if ('remarks' in (payload ?? {})) {
        document.remarks = payload?.remarks ?? null;
      }
      document.updatedAt = new Date().toISOString();
      return { handled: true, data: clone(document) as T };
    }
  }

  if (pathname === '/api/documents' && method === 'POST') {
    const leadId = Number(payload?.leadId ?? 0);
    if (!leadId) {
      throw new Error('leadId is required');
    }
    ensureLead(leadId);
    const documents = getCollection(mockDb.documents, leadId);
    const newDocument: MockDocument = {
      id: nextId.document++,
      leadId,
      documentType: typeof payload?.documentType === 'string' ? payload.documentType : 'Document',
      documentUrl: typeof payload?.documentUrl === 'string' ? payload.documentUrl : '',
      remarks: 'remarks' in (payload ?? {}) ? payload?.remarks ?? null : null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    documents.push(newDocument);
    return { handled: true, data: clone(newDocument) as T };
  }

  return { handled: false };
}

function parseBody(options: MockRequestOptions) {
  if (options.jsonBody !== undefined) {
    return options.jsonBody;
  }

  const raw = options.rawBody;
  if (typeof raw === 'string') {
    try {
      return JSON.parse(raw);
    } catch {
      return raw;
    }
  }

  return raw;
}

function normalizePath(path: string): string {
  try {
    const url = new URL(path, 'http://localhost');
    return trimTrailingSlash(url.pathname);
  } catch {
    const [base] = path.split('?');
    return trimTrailingSlash(base);
  }
}

function trimTrailingSlash(pathname: string) {
  if (pathname.length > 1 && pathname.endsWith('/')) {
    return pathname.slice(0, -1);
  }
  return pathname;
}

function ensureLead(leadId: number): MockLead {
  const lead = mockDb.leads.get(leadId);
  if (!lead) {
    throw new Error(`Lead ${leadId} not found`);
  }
  return lead;
}

function getCollection<T>(map: Map<number, T[]>, key: number): T[] {
  if (!map.has(key)) {
    map.set(key, []);
  }
  return map.get(key)!;
}

function findDocument(documentId: number) {
  for (const [, docs] of mockDb.documents.entries()) {
    const document = docs.find((item) => item.id === documentId);
    if (document) {
      return { document };
    }
  }
  return undefined;
}

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value));
}
