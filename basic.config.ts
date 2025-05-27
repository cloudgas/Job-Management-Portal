
export const schema = {
  project_id: "3b4934e8-2109-46b7-aa34-d1ba4ac2312e", // This is the project ID we got when creating the Basic Tech project
  version: 0,
  tables: {
    clients: {
      type: 'collection',
      fields: {
        name: {
          type: 'string',
          indexed: true
        },
        email: {
          type: 'string',
          indexed: true
        },
        phone: {
          type: 'string',
          indexed: true
        }
      }
    },
    jobs: {
      type: 'collection',
      fields: {
        clientId: {
          type: 'string',
          indexed: true
        },
        description: {
          type: 'string',
          indexed: true
        },
        date: {
          type: 'string',
          indexed: true
        },
        notes: {
          type: 'string',
          indexed: true
        }
      }
    },
    jobItems: {
      type: 'collection',
      fields: {
        jobId: {
          type: 'string',
          indexed: true
        },
        itemId: {
          type: 'string',
          indexed: true
        },
        itemType: {
          type: 'string',
          indexed: true
        },
        name: {
          type: 'string',
          indexed: true
        },
        unitPrice: {
          type: 'string',
          indexed: true
        },
        quantity: {
          type: 'number',
          indexed: true
        },
        category: {
          type: 'string',
          indexed: true
        }
      }
    }
  }
};
