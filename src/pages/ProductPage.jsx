import { useState, useEffect, useRef, useCallback } from "react";
import axios from "axios";
import { Modal } from "bootstrap";
import Pagination from "../components/pagination";
import ProductModal from "../components/ProductModal";

const BASE_URL = import.meta.env.VITE_BASE_URL;
const API_PATH = import.meta.env.VITE_API_PATH;

// modal 輸入欄位預設值
const defaultModalState = {
  imageUrl: "",
  title: "",
  category: "",
  unit: "",
  origin_price: "",
  price: "",
  description: "",
  content: "",
  is_enabled: 0,
  imagesUrl: [""],
};

function ProductPage({ setIsAuth }) {
  const [products, setProducts] = useState([]);
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);

  const getProducts = useCallback(
    async (page = 1) => {
      try {
        const res = await axios.get(
          `${BASE_URL}/v2/api/${API_PATH}/admin/products?page=${page}`
        );
        setProducts(res.data.products);
        setPageInfo(res.data.pagination);
      } catch (error) {
        console.log(error);
        alert("取得產品失敗");
      }
    },
    [setProducts]
  );

  // const getProducts = async () => {
  //   try {
  //     const res = await axios.get(
  //       `${BASE_URL}/v2/api/${API_PATH}/admin/products`
  //     );
  //     setProducts(res.data.products);
  //   } catch (error) {
  //     console.log(error);
  //     alert("取得產品失敗");
  //   }
  // };

  const checkUserLogin = useCallback(async () => {
    try {
      await axios.post(`${BASE_URL}/v2/api/user/check`);
      getProducts();
      setIsAuth(true);
    } catch (error) {
      console.error(error);
    }
  }, [getProducts, setIsAuth]);

  // const checkUserLogin = async () => {
  //   try {
  //     await axios.post(`${BASE_URL}/v2/api/user/check`);
  //     getProducts();
  //     setIsAuth(true);
  //   } catch (error) {
  //     console.error(error);
  //   }
  // };

  useEffect(() => {
    const token = document.cookie.replace(
      // eslint-disable-next-line no-useless-escape
      /(?:(?:^|.*;\s*)hexToken\s*\=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common["Authorization"] = token;
    checkUserLogin();
  }, [checkUserLogin]);

  const delProductModalRef = useRef(null);
  const [modalMode, setModalMode] = useState(null);

  useEffect(() => {
    new Modal(delProductModalRef.current, {
      backdrop: false,
    });
  }, []);

  const handleOpenProductModal = (mode, product) => {
    setModalMode(mode);

    switch (mode) {
      case "create":
        setTempProduct(defaultModalState);
        break;

      case "edit":
        setTempProduct(product);
        break;

      default:
        break;
    }

    setIsProductModalOpen(true);
  };

  const handleOpenDelProductModal = (product) => {
    setTempProduct(product);
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.show();
  };
  const handleCloseDelProductModal = () => {
    const modalInstance = Modal.getInstance(delProductModalRef.current);
    modalInstance.hide();
  };

  const [tempProduct, setTempProduct] = useState(defaultModalState);

  const deleteProduct = async () => {
    try {
      await axios.delete(
        `${BASE_URL}/v2/api/${API_PATH}/admin/product/${tempProduct.id}`
      );
    } catch (error) {
      console.log(error);
      alert("刪除產品失敗");
    }
  };

  const handleDeleteProduct = async () => {
    try {
      await deleteProduct();
      getProducts();
      handleCloseDelProductModal();
    } catch (error) {
      console.log(error);
      alert("刪除產品失敗");
    }
  };

  const [pageInfo, setPageInfo] = useState({});

  // const handlePageChange = (page) => {
  //   getProducts(page);
  // };

  return (
    <>
      <div className="container py-5">
        <div className="row">
          <div className="col">
            <div className="d-flex justify-content-between">
              <h2>產品列表</h2>
              <button
                onClick={() => {
                  handleOpenProductModal("create");
                }}
                type="button"
                className="btn btn-primary"
              >
                建立新的產品
              </button>
            </div>
            <table className="table">
              <thead>
                <tr>
                  <th scope="col">產品名稱</th>
                  <th scope="col">原價</th>
                  <th scope="col">售價</th>
                  <th scope="col">是否啟用</th>
                  <th scope="col"></th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <th scope="row">{product.title}</th>
                    <td>{product.origin_price}</td>
                    <td>{product.price}</td>
                    <td>
                      {product.is_enabled ? (
                        <span className="text-success">啟用</span>
                      ) : (
                        <span>未啟用</span>
                      )}
                    </td>
                    <td>
                      <div className="btn-group">
                        <button
                          onClick={() => {
                            handleOpenProductModal("edit", product);
                          }}
                          type="button"
                          className="btn btn-outline-primary btn-sm"
                        >
                          編輯
                        </button>
                        <button
                          onClick={() => {
                            handleOpenDelProductModal(product);
                          }}
                          type="button"
                          className="btn btn-outline-danger btn-sm"
                        >
                          刪除
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <Pagination pageInfo={pageInfo} getProducts={getProducts} />
      </div>

      <ProductModal
        modalMode={modalMode}
        tempProduct={tempProduct}
        getProducts={getProducts}
        isOpen={isProductModalOpen}
        setIsOpen={setIsProductModalOpen}
      />

      <div
        ref={delProductModalRef}
        className="modal fade"
        id="delProductModal"
        tabIndex="-1"
        style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
      >
        <div className="modal-dialog">
          <div className="modal-content">
            <div className="modal-header">
              <h1 className="modal-title fs-5">刪除產品</h1>
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn-close"
                data-bs-dismiss="modal"
                aria-label="Close"
              ></button>
            </div>
            <div className="modal-body">
              你是否要刪除
              <span className="text-danger fw-bold">{tempProduct.title}</span>
            </div>
            <div className="modal-footer">
              <button
                onClick={handleCloseDelProductModal}
                type="button"
                className="btn btn-secondary"
              >
                取消
              </button>
              <button
                onClick={handleDeleteProduct}
                type="button"
                className="btn btn-danger"
              >
                刪除
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default ProductPage;
