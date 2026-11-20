import type { SweetAlertOptions, SweetAlertResult } from 'sweetalert2';

// SweetAlert2 is ~76 KB and only needed once a dialog actually opens; a static import put it in
// every list page's eager bundle. Callers already treat fire() as a promise, so the first call
// simply waits for the chunk.
export const Swal = {
    fire(options: SweetAlertOptions): Promise<SweetAlertResult> {
        return import('sweetalert2').then((m) => m.default.fire(options));
    },
};
