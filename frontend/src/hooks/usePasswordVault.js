import { useEffect, useRef, useState } from 'react';
import {
  listPasswordLists,
  createPasswordList,
  updatePasswordList,
  deletePasswordList,
  listPasswordItems,
  createPasswordItem,
  deletePasswordItem,
  getPasswordItem,
} from '../api/client';
import { copyToClipboard } from '../utils/clipboard';

export function usePasswordVault({ flash }) {
  // lists
  const [lists, setLists] = useState([]);
  const [listTitle, setListTitle] = useState('');
  const [listFieldErrors, setListFieldErrors] = useState({});

  const [creatingList, setCreatingList] = useState(false);
  const [deletingListId, setDeletingListId] = useState(null);

  // selected list + items
  const [selectedList, setSelectedList] = useState(null);
  const [items, setItems] = useState([]);
  const [openingListId, setOpeningListId] = useState(null);

  // modal (add password)
  const [addOpen, setAddOpen] = useState(false);
  const [itemTitle, setItemTitle] = useState('');
  const [itemSecret, setItemSecret] = useState('');
  const [itemFieldErrors, setItemFieldErrors] = useState({});
  const [creatingItem, setCreatingItem] = useState(false);
  const [deletingItemId, setDeletingItemId] = useState(null);

  const openItemsReqId = useRef(0);

  // init lists
  useEffect(() => {
    (async () => {
      try {
        const data = await listPasswordLists();
        setLists(data);
      } catch (e) {
        console.error(e);
      }
    })();
  }, []);

  // list actions
  const createListAction = async () => {
    flash.reset();
    setListFieldErrors({});
    setCreatingList(true);
    try {
      const created = await createPasswordList(listTitle);
      setLists((p) => [created, ...p]);
      setListTitle('');
      return created;
    } catch (e) {
      const errs = flash.fail(e, '作成に失敗しました');
      setListFieldErrors(errs);
      return null;
    } finally {
      setCreatingList(false);
    }
  };

  const updateListAction = async (listId, payload) => {
    flash.reset();
    try {
      const updated = await updatePasswordList(listId, payload);
      setLists((p) => p.map((x) => (x.id === listId ? updated : x)));
      return updated;
    } catch (e) {
      flash.fail(e, '更新に失敗しました');
      return null;
    }
  };

  const deleteListAction = async (id, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;
    setDeletingListId(id);
    try {
      await deletePasswordList(id);
      setLists((p) => p.filter((x) => x.id !== id));
      if (selectedList?.id === id) {
        setSelectedList(null);
        setItems([]);
      }
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingListId(null);
    }
  };

  const openListAction = async (list) => {
    flash.reset();
    const reqId = ++openItemsReqId.current;
    setOpeningListId(list.id);
    setSelectedList(list);

    try {
      const data = await listPasswordItems(list.id);
      if (reqId !== openItemsReqId.current) return;
      setItems(data);
    } catch (e) {
      if (reqId !== openItemsReqId.current) return;
      flash.fail(e, '取得に失敗しました');
    } finally {
      if (reqId === openItemsReqId.current) setOpeningListId(null);
    }
  };

  // modal helpers
  const openAddModal = () => {
    setItemFieldErrors({});
    setItemTitle('');
    setItemSecret('');
    setAddOpen(true);
  };
  const closeAddModal = () => setAddOpen(false);

  // item actions
  const createItemAction = async () => {
    if (!selectedList) return;
    flash.reset();
    setItemFieldErrors({});
    setCreatingItem(true);
    try {
      const created = await createPasswordItem(selectedList.id, {
        title: itemTitle,
        secret: itemSecret,
      });
      setItems((p) => [created, ...p]);
      setAddOpen(false);
    } catch (e) {
      const errs = flash.fail(e, '追加に失敗しました');
      setItemFieldErrors(errs);
    } finally {
      setCreatingItem(false);
    }
  };

  const deleteItemAction = async (id, { confirmed } = { confirmed: false }) => {
    flash.reset();
    if (!confirmed) return;
    setDeletingItemId(id);
    try {
      await deletePasswordItem(id);
      setItems((p) => p.filter((x) => x.id !== id));
    } catch (e) {
      flash.fail(e, '削除に失敗しました');
    } finally {
      setDeletingItemId(null);
    }
  };

  // 一覧で「タップでコピー」：押した瞬間だけ詳細を取得してコピー
  const copySecretAction = async (itemId) => {
    flash.reset();
    try {
      const detail = await getPasswordItem(itemId);
      const ok = await copyToClipboard(detail.secret ?? '');
      flash.info = ok ? 'コピーしました' : 'コピーできませんでした';
    } catch (e) {
      flash.fail(e, 'コピーに失敗しました');
    }
  };

  return {
    // lists
    lists, listTitle, setListTitle, listFieldErrors,
    creatingList, deletingListId,
    createListAction, updateListAction, deleteListAction,

    // selected + items
    selectedList, items, openingListId,
    openListAction,

    // modal
    addOpen, openAddModal, closeAddModal,
    itemTitle, setItemTitle,
    itemSecret, setItemSecret,
    itemFieldErrors, creatingItem,
    createItemAction,

    // item ops
    deletingItemId, deleteItemAction,
    copySecretAction,
  };
}