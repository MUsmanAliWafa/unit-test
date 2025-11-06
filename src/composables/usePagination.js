import { ref, computed } from "vue";

export function usePagination(totalItems, perPageOptions = [10, 20, 50, 100]) {
    const perPage = ref(10);
    const currentPage = ref(1);

    const totalPages = computed(() =>
        Math.ceil(totalItems.value / perPage.value)
    );

    const nextPage = () => {
        if (currentPage.value < totalPages.value) currentPage.value++;
    };

    const prevPage = () => {
        if (currentPage.value > 1) currentPage.value--;
    };

    const setPerPage = (n) => {
        perPage.value = n;
        currentPage.value = 1;
    };

    return { perPage, currentPage, totalPages, nextPage, prevPage, setPerPage };
}
