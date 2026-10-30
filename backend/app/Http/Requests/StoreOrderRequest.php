<?php

namespace App\Http\Requests;

use App\Models\Customer;
use Illuminate\Foundation\Http\FormRequest;

class StoreOrderRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        $isNew = ! Customer::where('email', $this->input('email'))->exists();

        return [
            'email'                 => ['required', 'email:rfc', 'max:255'],
            'name'                  => [$isNew ? 'required' : 'nullable', 'string', 'max:255'],
            'items'                 => ['required', 'array', 'min:1'],
            'items.*.product_id'    => ['required', 'integer', 'exists:products,id'],
            'items.*.quantity'      => ['required', 'integer', 'min:1', 'max:100000'],
            'amount_given'          => ['required', 'numeric', 'min:1'],
        ];
    }
}
