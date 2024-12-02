import Breadcrumb from '../components/Breadcrumbs/Breadcrumb';
import Item from '../components/Tables/Item';
import Category from '../components/Tables/Category';
import Employee from '../components/Tables/Employee';
import Supplier from '../components/Tables/Supplier';
import Invoice from '../components/Tables/Invoice';

const Tables = () => {
  return (
    <>
      <Breadcrumb pageName="Tables" />

      <div className="flex flex-col gap-10">
        <Item />
        <Employee />
        <Category />
        <Supplier />
        <Invoice />
      </div>
    </>
  );
};

export default Tables;
