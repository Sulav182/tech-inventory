import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  useMaterialReactTable,
} from 'material-react-table';
import {
  QueryClient,
  QueryClientProvider,
  useQuery,
} from '@tanstack/react-query';


export type Invoice = {
  invoice_id: string,
  order_id: string,
  transaction_type: string
  total: string,
  seller: string, 
  card_details: string,
};


const InvoiceTable = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Invoice>[]>(
    () => [
      {
        accessorKey: 'invoice_id',
        header: 'Invoice ID',
        enableEditing: false,
        size: 80,
      },
      {
        accessorKey: 'order_id',
        header: 'Order ID',
        // muiEditTextFieldProps: {
        //   required: true,
        //   error: !!validationErrors?.id,
        //   helperText: validationErrors?.id,
        //   //remove any previous validation errors when user focuses on the input
        //   onFocus: () =>
        //     setValidationErrors({
        //       ...validationErrors,
        //       firstName: undefined,
        //     }),
        //   //optionally add validation checking for onBlur or onChange
        // },
      },
      {
        accessorKey: 'transaction_type',
        header: 'Transaction Type',
      },
      {
        accessorKey: 'total',
        header: 'Total',
      },
      {
        accessorKey: 'seller',
        header: 'Seller',
      },
      {
        accessorKey: 'card_details',
        header: 'Card Details',
      }
      
    ],
    [validationErrors],
  );


  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
    // enableEditing: true,
    getRowId: (row) => row.invoice_id,
    muiToolbarAlertBannerProps: isLoadingUsersError
      ? {
          color: 'error',
          children: 'Error loading data',
        }
      : undefined,
    muiTableContainerProps: {
      sx: {
        minHeight: '500px',
      },
    },
    onCreatingRowCancel: () => setValidationErrors({}),
    //onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    //onEditingRowSave: handleSaveUser,
    // renderRowActions: ({ row, table }) => (
    //   <Box sx={{ display: 'flex', gap: '1rem' }}>
    //     <Tooltip title="Edit">
    //       <IconButton onClick={() => table.setEditingRow(row)}>
    //         <EditIcon />
    //       </IconButton>
    //     </Tooltip>
    //     <Tooltip title="Delete">
    //       <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
    //         <DeleteIcon />
    //       </IconButton>
    //     </Tooltip>
    //   </Box>
    // ),
    // renderTopToolbarCustomActions: ({ table }) => (
    //   <Button
    //     variant="contained"
    //     onClick={() => {
    //       table.setCreatingRow(true); //simplest way to open the create row modal with no default values
    //       //or you can pass in a row object to set default values with the `createRow` helper function
    //       // table.setCreatingRow(
    //       //   createRow(table, {
    //       //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
    //       //   }),
    //       // );
    //     }}
    //   >
    //     Create New User
    //   </Button>
    // ),
    state: {
      isLoading: isLoadingUsers,
      //isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return <MaterialReactTable table={table} />;
};

//READ hook (get users from api)
function useGetUsers() {
  return useQuery<Invoice[]>({
    queryKey: ['invoices'],
    queryFn: async () => {
      //send api request here
      // await new Promise((resolve) => fetch("https://jsonplaceholder.typicode.com/users")); //fake api call
      // return Promise.resolve(fakeData);
      const res = await Promise.resolve(fetch("http://127.0.0.1:5000/table_data/invoice"))
      return res.json();
    },
    refetchOnWindowFocus: false,
  });
}


const queryClient = new QueryClient();

const InvoiceWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <InvoiceTable />
  </QueryClientProvider>
);

export default InvoiceWithProviders;
