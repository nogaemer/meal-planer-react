import {Field, FieldGroup, FieldLabel, FieldLegend, FieldSet,} from "@/components/ui/field"
import {Input} from "@/components/ui/input"
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue,} from "@/components/ui/select"
import {Textarea} from "@/components/ui/textarea"


export const MealEditMetaData = () => {
    return (
        <div className="w-full bg-card p-6 rounded-3xl">
            <form>
                <FieldGroup>
                    <FieldSet>
                        <FieldLegend>Rezeptinformationen</FieldLegend>
                        <FieldGroup>
                            <Field>
                                <FieldLabel htmlFor="checkout-7j9-card-name-43j">
                                    Rezept Name
                                </FieldLabel>
                                <Input
                                    id="checkout-7j9-card-name-43j"
                                    placeholder="Spagetti"
                                    required
                                />
                            </Field>
                            <Field>
                                <FieldLabel htmlFor="checkout-7j9-optional-comments">
                                    Beschreibung
                                </FieldLabel>
                                <Textarea
                                    id="checkout-7j9-optional-comments"
                                    placeholder="Geben Sie eine kurze Beschreibung des Rezepts ein"
                                    className="resize-y"
                                />
                            </Field>
                            <div className="grid grid-cols-2 gap-4">
                                <Field>
                                    <FieldLabel htmlFor="checkout-exp-month-ts6">
                                        Schwierigkeit
                                    </FieldLabel>
                                    <Select defaultValue="">
                                        <SelectTrigger id="checkout-exp-month-ts6">
                                            <SelectValue placeholder="Mittel"/>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="schwer">Schwer</SelectItem>
                                            <SelectItem value="mittel">Mittel</SelectItem>
                                            <SelectItem value="leicht">Leicht</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </Field>
                                <Field>
                                    <FieldLabel htmlFor="checkout-7j9-cvv">Zeit in Minuten</FieldLabel>
                                    <Input id="checkout-7j9-cvv" placeholder="120" required/>
                                </Field>
                            </div>
                        </FieldGroup>
                    </FieldSet>
                </FieldGroup>
            </form>
        </div>
    )
}