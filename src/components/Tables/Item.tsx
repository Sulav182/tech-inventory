import { useMemo, useState } from 'react';
import {
  MaterialReactTable,
  // createRow,
  type MRT_ColumnDef,
  type MRT_Row,
  type MRT_TableOptions,
  useMaterialReactTable,
} from 'material-react-table';
import { Box, Button, IconButton, Tooltip } from '@mui/material';
import {
  QueryClient,
  QueryClientProvider,
  useMutation,
  useQuery,
  useQueryClient,
} from '@tanstack/react-query';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

export type Item = {
  category_id: string,
  item_id: string,
  name: string,
  price: string,
  quantity:string,
  type: string
};

const ItemTable = () => {
  const [validationErrors, setValidationErrors] = useState<
    Record<string, string | undefined>
  >({});

  const columns = useMemo<MRT_ColumnDef<Item>[]>(
    () => [
      {
        accessorKey: 'item_id',
        header: 'Item Id',
        // enableEditing: false,
        // size: 80,
      },
      {
        accessorKey: 'category_id',
        header: 'Category ID',
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
        accessorKey: 'name',
        header: 'Name',
        // muiEditTextFieldProps: {
        //   required: true,
        //   error: !!validationErrors?.title,
        //   helperText: validationErrors?.title,
        //   //remove any previous validation errors when user focuses on the input
        //   onFocus: () =>
        //     setValidationErrors({
        //       ...validationErrors,
        //       lastName: undefined,
        //     }),
        // },
      },
      {
        accessorKey: 'price',
        header: 'Price',
        // muiEditTextFieldProps: {
        //   //type: 'email',
        //   required: true,
        //   error: !!validationErrors?.completed,
        //   helperText: validationErrors?.completed,
        //   //remove any previous validation errors when user focuses on the input
        //   onFocus: () =>
        //     setValidationErrors({
        //       ...validationErrors,
        //       email: undefined,
        //     }),
        // },
      },
      {
        accessorKey: 'quantity',
        header: 'Quantity',
        // editVariant: 'select',
        // editSelectOptions: usStates,
        // muiEditTextFieldProps: {
        //   select: true,
        //   error: !!validationErrors?.state,
        //   helperText: validationErrors?.state,
        // },
      },
      {
        accessorKey: 'type',
        header: 'Type',
      },
    ],
    [validationErrors],
  );

  //call CREATE hook
  const { mutateAsync: createUser, isPending: isCreatingUser } =
    useCreateUser();
  //call READ hook
  const {
    data: fetchedUsers = [],
    isError: isLoadingUsersError,
    isFetching: isFetchingUsers,
    isLoading: isLoadingUsers,
  } = useGetUsers();
  //console.log(data)
  //call UPDATE hook
  const { mutateAsync: updateUser, isPending: isUpdatingUser } =
    useUpdateUser();
  //call DELETE hook
  const { mutateAsync: deleteUser, isPending: isDeletingUser } =
    useDeleteUser();

  //CREATE action
  const handleCreateUser: MRT_TableOptions<Item>['onCreatingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateItem(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await createUser(values);
    table.setCreatingRow(null); //exit creating mode
  };

  //UPDATE action
  const handleSaveUser: MRT_TableOptions<Item>['onEditingRowSave'] = async ({
    values,
    table,
  }) => {
    const newValidationErrors = validateItem(values);
    if (Object.values(newValidationErrors).some((error) => error)) {
      setValidationErrors(newValidationErrors);
      return;
    }
    setValidationErrors({});
    await updateUser(values);
    table.setEditingRow(null); //exit editing mode
  };

  //DELETE action
  const openDeleteConfirmModal = (row: MRT_Row<Item>) => {
    if (window.confirm('Are you sure you want to delete this item?')) {
      deleteUser(row.original.item_id);
    }
  };

  const table = useMaterialReactTable({
    columns,
    data: fetchedUsers,
    createDisplayMode: 'row', // ('modal', and 'custom' are also available)
    editDisplayMode: 'row', // ('modal', 'cell', 'table', and 'custom' are also available)
    enableEditing: true,
    getRowId: (row) => row.item_id,
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
    onCreatingRowSave: handleCreateUser,
    onEditingRowCancel: () => setValidationErrors({}),
    onEditingRowSave: handleSaveUser,
    renderRowActions: ({ row, table }) => (
      <Box sx={{ display: 'flex', gap: '1rem' }}>
        <Tooltip title="Edit">
          <IconButton onClick={() => table.setEditingRow(row)}>
            <EditIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Delete">
          <IconButton color="error" onClick={() => openDeleteConfirmModal(row)}>
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    ),
    renderTopToolbarCustomActions: ({ table }) => (
      <Button
        variant="contained"
        onClick={() => {
          table.setCreatingRow(true); //simplest way to open the create row modal with no default values
          //or you can pass in a row object to set default values with the `createRow` helper function
          // table.setCreatingRow(
          //   createRow(table, {
          //     //optionally pass in default values for the new row, useful for nested data or other complex scenarios
          //   }),
          // );
        }}
      >
        Create New Item
      </Button>
    ),
    state: {
      isLoading: isLoadingUsers,
      isSaving: isCreatingUser || isUpdatingUser || isDeletingUser,
      showAlertBanner: isLoadingUsersError,
      showProgressBars: isFetchingUsers,
    },
  });

  return <MaterialReactTable table={table} />;
};

//CREATE hook (post new user to api)
function useCreateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Item) => {
      //send api update request here
      const res = await Promise.resolve(fetch("http://127.0.0.1:5000/items",{
        method: "post",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        // //make sure to serialize your JSON body
        body: JSON.stringify(item)
      }))
      return res.json();
    },
    //client side optimistic update
    onMutate: (newItemInfo: Item) => {
      queryClient.setQueryData(
        ['items'],
        (prevItems: any) =>
          [
            ...prevItems,
            {
              ...newItemInfo,
              //id: (Math.random() + 1).toString(36).substring(7),
            },
          ] as Item[],
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch users after mutation, disabled for demo
  });
}

//READ hook (get users from api)
function useGetUsers() {
  return useQuery<Item[]>({
    queryKey: ['items'],
    queryFn: async () => {
      //send api request here
      // await new Promise((resolve) => fetch("https://jsonplaceholder.typicode.com/users")); //fake api call
      // return Promise.resolve(fakeData);
      const res = await Promise.resolve(fetch("http://127.0.0.1:5000/table_data/items"))
      return res.json();
    },
    refetchOnWindowFocus: false,
  });
}

//UPDATE hook (put user in api)
function useUpdateUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (item: Item) => {
      //send api update request here
      const res = await Promise.resolve(fetch("http://127.0.0.1:5000/items",{
        method: "put",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        // //make sure to serialize your JSON body
        body: JSON.stringify(item)
      }))
      return res.json();
    },
    //client side optimistic update
    onMutate: (newItemInfo: Item) => {
      queryClient.setQueryData(['items'], (prevItems: any) =>
        prevItems?.map((prevItem: Item) =>
          prevItem.item_id === newItemInfo.item_id ? newItemInfo : prevItem,
        ),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch users after mutation, disabled for demo
  });
}

//DELETE hook (delete user in api)
function useDeleteUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (itemId: string) => {
      //send api update request here
      const res = await Promise.resolve(fetch("http://127.0.0.1:5000/items",{
        method: "delete",
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },

        // //make sure to serialize your JSON body
        body: JSON.stringify(itemId)
      }))
      return res.json();
    },
    //client side optimistic update
    onMutate: (itemId: string) => {
      queryClient.setQueryData(['items'], (prevUsers: any) =>
        prevUsers?.filter((item: Item) => item.item_id !== itemId),
      );
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey: ['items'] }), //refetch users after mutation, disabled for demo
  });
}

const queryClient = new QueryClient();

const ItemWithProviders = () => (
  //Put this with your other react-query providers near root of your app
  <QueryClientProvider client={queryClient}>
    <ItemTable />
  </QueryClientProvider>
);

export default ItemWithProviders;

const validateRequired = (value: string) => !!value.length;
const validateEmail = (email: string) =>
  !!email.length &&
  email
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    );

function validateItem(item: Item) {
  return {
    name: !validateRequired(item.name)
      ? 'Name is Required'
      : '',
    price: !validateRequired(item.price) ? 'Price is required' : '',
    //userId: !validateRequired(user.userId) ? 'usedId' : '',
  };
}
