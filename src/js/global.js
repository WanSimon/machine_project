import Conf from './conf';
import productCategory from './category';
const ProductCategory = new productCategory();
ProductCategory.init();
Conf.typeArr = ProductCategory.showCategory;
global.$conf = Conf;
